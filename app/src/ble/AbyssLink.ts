import { ble } from './BleService';
import { Op, buildFrame, parseFrame } from './protocol';

export class AbyssLink {
  private seq = 1;
  private unsub: (()=>void) | null = null;

  async handshake(): Promise<{ model:string; serial:string; firmware:string }> {
    const svc = ble.uu.service, ctrl = ble.uu.ctrlChar, data = ble.uu.dataChar;
    const payload = new Uint8Array([0x01]);
    const frame = buildFrame(Op.HANDSHAKE_REQ, this.seq++, payload);
    return await this.writeAndWait(ctrl, data, frame, Op.HANDSHAKE_ACK, (p) => this.decodeInfoTLV(p));
  }

  async getSession(sinceTs?: number): Promise<{ dive_id:number; start_ts:number; duration:number; samples_count:number; alerts_count:number; compass_count:number }>{
    const svc = ble.uu.service, ctrl = ble.uu.ctrlChar, data = ble.uu.dataChar;
    const ts = sinceTs||0; const p = new Uint8Array(4);
    p=(ts>>>24)&0xFF; p[1]=(ts>>>16)&0xFF; p=(ts>>>8)&0xFF; p=ts&0xFF;
    const frame = buildFrame(Op.GET_SESSION, this.seq++, p);
    return await this.writeAndWait(ctrl, data, frame, Op.SESSION_META, (pl)=>this.decodeSession(pl));
  }

  async* pullChunks(kind: 1|2|3, total: number) {
    const svc = ble.uu.service, ctrl = ble.uu.ctrlChar, data = ble.uu.dataChar;
    for (let index=0; index<total; index++){
      const req = this.encodeGetNext(kind, index);
      const frame = buildFrame(Op.GET_NEXT_CHUNK, this.seq++, req);
      const resp = await this.writeAndWait(ctrl, data, frame, Op.CHUNK_DATA, (p)=>this.decodeChunk(p));
      if (resp.type !== kind || resp.index !== index) throw new Error('Chunk mismatch');
      // ACK
      const ack = buildFrame(Op.ACK, this.seq++, this.encodeGetNext(kind, index));
      await ble.write(svc, ctrl, ack, true);
      yield { index, data: resp.buf };
    }
  }

  private async writeAndWait<T>(
    ctrlChar: string, dataChar: string, frame: Uint8Array, expectOp: number, map: (p:Uint8Array)=>T
  ): Promise<T> {
    const svc = ble.uu.service;
    return new Promise<T>((resolve, reject) => {
      let done = false;
      let unsub: (()=>void) | null = null;
      const timeout = setTimeout(()=>{ if(!done){ done=true; unsub?.(); reject(new Error('BLE timeout')); } }, 10000);
      ble.subscribe(svc, dataChar, (bytes)=>{
        const f = parseFrame(bytes);
        if (f && f.op===expectOp && !done) {
          done = true; clearTimeout(timeout); unsub?.(); resolve(map(f.payload));
        }
      }).then(u=>{
        unsub = u;
        ble.write(svc, ctrlChar, frame, true).catch(err=>{ if(!done){ done=true; clearTimeout(timeout); unsub?.(); reject(err); } });
      }).catch(reject);
    });
  }

  private decodeInfoTLV(p: Uint8Array): { model:string; serial:string; firmware:string } {
    const dec = new TextDecoder(); let i=0; const out:any={ model:'', serial:'', firmware:'' };
    while (i<p.length){ const t=p[i++], l=p[i++], v=p.slice(i, i+l); i+=l; const s = dec.decode(v);
      if (t===0x01) out.model=s; else if (t===0x02) out.serial=s; else if (t===0x03) out.firmware=s;
    }
    return out;
  }

  private decodeSession(p: Uint8Array) {
    const rd=(o:number)=> (p[o]<<24)|(p[o+1]<<16)|(p[o+2]<<8)|p[o+3];
    return {
      dive_id: rd(0),
      start_ts: rd(4),
      duration: rd(8),
      samples_count: rd(12),
      alerts_count: rd(16),
      compass_count: rd(20),
    };
  }

  private encodeGetNext(kind:number, idx:number){ const u=new Uint8Array(5); u=kind; u[1]=(idx>>>24)&0xFF; u=(idx>>>16)&0xFF; u=(idx>>>8)&0xFF; u=idx&0xFF; return u; }
  private decodeChunk(p: Uint8Array){ const type=p; const idx=(p[1]<<24)|(p<<16)|(p<<8)|p; const buf=p.slice(5); return { type, index: idx, buf }; }
}
