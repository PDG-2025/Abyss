import { BleManager, Device } from 'react-native-ble-plx';

export type BleStatus = 'idle' | 'scanning' | 'connecting' | 'connected' | 'discovering' | 'ready' | 'transferring' | 'updating' | 'error';
export type BleError = { message: string; code?: string };

type Uuids = {
  service: string;
  ctrlChar: string;
  dataChar: string;
  otaChar?: string;
  infoChar?: string;
};

const DEFAULT_UUIDS: Uuids = {
  service: '0000ABCD-0000-1000-8000-00805F9B34FB',
  ctrlChar: '0000AB01-0000-1000-8000-00805F9B34FB',
  dataChar: '0000AB02-0000-1000-8000-00805F9B34FB',
  otaChar:  '0000AB03-0000-1000-8000-00805F9B34FB',
  infoChar: '0000AB04-0000-1000-8000-00805F9B34FB',
};

class BleService {
  private manager = new BleManager();
  private _device: Device | null = null;
  private _uuids: Uuids = DEFAULT_UUIDS;

  status: BleStatus = 'idle';
  onStatus?: (s: BleStatus) => void;
  onError?: (e: BleError) => void;

  private setStatus(s: BleStatus) { this.status = s; this.onStatus?.(s); }
  private setError(e: BleError) { this.status = 'error'; this.onError?.(e); }

  get device() { return this._device; }
  get uu() { return this._uuids; }

  async scanAndConnect(match: (d: Device) => boolean, timeoutMs = 12000) {
    this.setStatus('scanning');
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.manager.stopDeviceScan();
        reject({ message: 'Scan timeout' } as BleError);
      }, timeoutMs);

      this.manager.startDeviceScan(null, { allowDuplicates: false }, async (error, device) => {
        if (error) {
          clearTimeout(timer);
          this.manager.stopDeviceScan();
          return reject({ message: error.message });
        }
        if (device && match(device)) {
          this.manager.stopDeviceScan();
          clearTimeout(timer);
          try {
            this.setStatus('connecting');
            const dev = await device.connect({ timeout: 10000 });
            this.setStatus('discovering');
            const d2 = await dev.discoverAllServicesAndCharacteristics();
            try { await d2.requestMTU(185); } catch {}
            this._device = d2;
            this.setStatus('ready');
            resolve();
          } catch (e: any) {
            reject({ message: e?.message || 'Connect error' });
          }
        }
      });
    });
  }

  async read(serviceUUID: string, charUUID: string): Promise<Uint8Array> {
    if (!this._device) throw new Error('No device');
    const c = await this._device.readCharacteristicForService(serviceUUID, charUUID);
    return this.base64ToBytes(c.value || '');
  }

  async write(serviceUUID: string, charUUID: string, data: Uint8Array, withResponse = true) {
    if (!this._device) throw new Error('No device');
    const value = this.bytesToBase64(data);
    if (withResponse) {
      await this._device.writeCharacteristicWithResponseForService(serviceUUID, charUUID, value);
    } else {
      await this._device.writeCharacteristicWithoutResponseForService(serviceUUID, charUUID, value);
    }
  }

  async subscribe(serviceUUID: string, charUUID: string, cb: (data: Uint8Array) => void): Promise<() => void> {
    if (!this._device) throw new Error('No device');
    const sub = await this._device.monitorCharacteristicForService(serviceUUID, charUUID, (error, c) => {
      if (error) return this.setError({ message: error.message });
      if (c?.value) cb(this.base64ToBytes(c.value));
    });
    return () => sub.remove();
  }

  disconnect() {
    if (this._device) {
      try { this._device.cancelConnection(); } catch {}
      this._device = null;
      this.setStatus('idle');
    }
  }

  // base64 helpers
  bytesToBase64(bytes: Uint8Array): string { return Buffer.from(bytes).toString('base64'); }
  base64ToBytes(b64: string): Uint8Array { return new Uint8Array(Buffer.from(b64, 'base64')); }

  setUuids(uuids: Partial<Uuids>) { this._uuids = { ...this._uuids, ...uuids }; }
}

export const ble = new BleService();
