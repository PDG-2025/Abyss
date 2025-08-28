import { api } from './api';
import { extractApiError } from './errors';

export type DeviceDTO = {
  device_id: number;
  user_id: number;
  serial_number: string;
  model: string;
  firmware_version: string;
};

export type BatteryDTO = {
  battery_id?: number;
  device_id: number;
  percentage: number;
  status_date: string;
};

export async function createDevice(body: { serial_number: string; model: string; firmware_version: string }) {
  try {
    const res = await api.post('/devices', body);
    return res.data as DeviceDTO;
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function listDevices() {
  try {
    const res = await api.get('/devices');
    return res.data as DeviceDTO[];
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function postBattery(device_id: number, percentage: number, status_date?: string) {
  try {
    const res = await api.post(`/devices/${device_id}/battery`, { percentage, status_date });
    return res.data as BatteryDTO;
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function listDeviceDives(device_id: number, page = 1, limit = 20) {
  try {
    const res = await api.get(`/devices/${device_id}/dives?page=${page}&limit=${limit}`);
    return res.data as { page: number; limit: number; data: any[] };
  } catch (e) {
    throw extractApiError(e);
  }
}
