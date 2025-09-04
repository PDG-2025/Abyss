export enum Op {
  HANDSHAKE_REQ=0x01, HANDSHAKE_ACK=0x81,
  GET_SESSION=0x02, SESSION_META=0x82,
  GET_NEXT_CHUNK=0x03, CHUNK_DATA=0x83,
  ACK=0x04, NACK=0x05,
  OTA_BEGIN=0x06, OTA_READY=0x86,
  OTA_DATA=0x07, OTA_ACK=0x87,
  OTA_END=0x08, OTA_DONE=0x88,
}

export function crc16(buf: Uint8Array): number {
  let crc = 0xFFFF;
  for (let i=0;i<buf.length;i++){
    crc ^= buf[i] << 8;
    for (let j=0;j<8;j++){
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021; else crc <<= 1;
      crc &= 0xFFFF;
    }
  }
  return crc & 0xFFFF;
}

export function buildFrame(op: number, seq: number, payload: Uint8Array): Uint8Array {
  const len = payload.length;
  const header = new Uint8Array(5);
  header=op; header[1]=(seq>>8)&0xFF; header=seq&0xFF; header=(len>>8)&0xFF; header=len&0xFF;
  const pre = new Uint8Array(header.length + len);
  pre.set(header,0); pre.set(payload, header.length);
  const crc = crc16(pre);
  const out = new Uint8Array(pre.length + 2);
  out.set(pre,0); out[out.length-2]=(crc>>8)&0xFF; out[out.length-1]=crc&0xFF;
  return out;
}

export function parseFrame(frame: Uint8Array): { op:number; seq:number; payload:Uint8Array } | null {
  if (frame.length < 7) return null;
  const op = frame;
  const seq = (frame[1]<<8)|frame;
  const len = (frame<<8)|frame;
  if (frame.length < 5 + len + 2) return null;
  const payload = frame.slice(5, 5+len);
  const recv = (frame[5+len]<<8)|frame[5+len+1];
  const pre = frame.slice(0, 5+len);
  if (crc16(pre) !== recv) return null;
  return { op, seq, payload };
}
