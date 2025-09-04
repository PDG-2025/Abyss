import { ble } from './BleService';
import { Op, buildFrame, parseFrame } from './protocol';

export type OtaOptions = { chunkSize?: number; maxRetries?: number; opTimeoutMs?: number; onProgress?: (offset:number, total:number)=>void; };

type Frame = { op:number; seq:number; payload:Uint8Array };

export async function otaUpdate(fwBytes: Uint8Array, versionStr: string, opts: OtaOptions = {}) {
  if (!ble.device) throw new Error('BLE non connecté');
  const svc = ble.uu.service, ctrl = ble.uu.ctrlChar, data = ble.uu.dataChar;
  const chunkSize = Math.max(20, Math.min(opts.chunkSize ?? 180, 240));
  const maxRetries = opts.maxRetries ?? 3;
  const opTimeoutMs = opts.opTimeoutMs ?? 10000;
  const seq = { v: 1 }; const nextSeq = ()=> seq.v++;

  const beginPayload = encodeBegin(fwBytes.length, versionStr);
  await writeAndExpect(ctrl, data, Op.OTA_BEGIN, Op.OTA_READY, beginPayload, nextSeq, opTimeoutMs, maxRetries);

  let offset = 0;
  while (offset < fwBytes.length) {
    const size = Math.min(chunkSize, fwBytes.length - offset);
    const chunk = fwBytes.slice(offset, offset+size);
    const p = encodeData(offset, chunk);
    const ack = await writeAndExpect(ctrl, data, Op.OTA_DATA, Op.OTA_ACK, p, nextSeq, opTimeoutMs, maxRetries);
    const ackOffset = decodeAckOffset(ack.payload);
    if (ackOffset !== offset) {
      // retry immédiat une fois
      const ack2 = await writeAndExpect(ctrl, data, Op.OTA_DATA, Op.OTA_ACK, p, nextSeq, opTimeoutMs, maxRetries);
      const ackOffset2 = decodeAckOffset(ack2.payload);
      if (ackOffset2 !== offset) throw new Error(`OTA ack mismatch (attendu ${offset}, reçu ${ackOffset2})`);
    }
    offset += size;
    opts.onProgress?.(offset, fwBytes.length);
  }

  await writeAndExpect(ctrl, data, Op.OTA_END, Op.OTA_DONE, new Uint8Array(), nextSeq, opTimeoutMs, maxRetries);
}

async function writeAndExpect(
  ctrlCharUUID: string,
  dataCharUUID: string,
  sendOp: number,
  expectOp: number,
  payload: Uint8Array,
  nextSeq: ()=>number,
  timeoutMs: number,
  maxRetries: number
): Promise<Frame> {
  const svc = ble.uu.service;
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    try {
      const frameToSend = buildFrame(sendOp, nextSeq(), payload);
      const resp = await waitForResponseOnce(svc, dataCharUUID, () => ble.write(svc, ctrlCharUUID, frameToSend, true), expectOp, timeoutMs);
      return resp;
    } catch (e) {
      if (attempt >= maxRetries) throw e;
      await delay(150);
    }
  }
  throw new Error('writeAndExpect: retrys épuisés');
}

function waitForResponseOnce(
  serviceUUID: string,
  dataCharUUID: string,
  writeAction: () => Promise<void>,
  expectOp: number,
  timeoutMs: number
): Promise<Frame> {
  return new Promise<Frame>((resolve, reject) => {
    let resolved = false;
    let unsub: (()=>void) | null = null;
    const to = setTimeout(()=>{ if (!resolved){ resolved=true; unsub?.(); reject(new Error('BLE/OTA timeout')); } }, timeoutMs);
    ble.subscribe(serviceUUID, dataCharUUID, (bytes)=>{
      const f = parseFrame(bytes);
      if (f && f.op===expectOp && !resolved) {
        resolved = true; clearTimeout(to); unsub?.(); resolve(f);
      }
    }).then(u=>{
      unsub = u;
      writeAction().catch(err=>{ if (!resolved){ resolved=true; clearTimeout(to); unsub?.(); reject(err); } });
    }).catch(reject);
  });
}

function encodeBegin(size: number, vstr: string): Uint8Array {
  const enc = new TextEncoder();
  const vs = enc.encode(vstr);
  const u = new Uint8Array(4+1+vs.length);
  u=(size>>>24)&0xFF; u[1]=(size>>>16)&0xFF; u=(size>>>8)&0xFF; u=size&0xFF;
  u=vs.length&0xFF; u.set(vs,5); return u;
}
function encodeData(offset:number, chunk:Uint8Array){ const u=new Uint8Array(4+chunk.length); u=(offset>>>24)&0xFF; u[1]=(offset>>>16)&0xFF; u=(offset>>>8)&0xFF; u=offset&0xFF; u.set(chunk,4); return u; }
function decodeAckOffset(p:Uint8Array){ if (p.length<4) return -1; return (p<<24)|(p[1]<<16)|(p<<8)|p; }
function delay(ms:number){ return new Promise(r=>setTimeout(r,ms)); }
