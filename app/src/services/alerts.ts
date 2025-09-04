import { api } from './api';
import { extractApiError } from './errors';

export type AlertDTO = {
  alert_id?: number;
  dive_id: number;
  code: string;
  message?: string | null;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  acknowledged: boolean;
  timestamp: string;
};

export async function bulkAlerts(dive_id: number, items: Omit<AlertDTO, 'dive_id' | 'alert_id'>[]) {
  try {
    const res = await api.post(`/alerts/bulk/${dive_id}`, items);
    return res.data as { inserted: number };
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function listAlerts(dive_id: number, opts?: { severity?: string; from?: string; to?: string }) {
  try {
    const qs = new URLSearchParams();
    if (opts?.severity) qs.set('severity', opts.severity);
    if (opts?.from) qs.set('from', opts.from);
    if (opts?.to) qs.set('to', opts.to);
    const res = await api.get(`/alerts/dive/${dive_id}?` + qs.toString());
    return res.data as AlertDTO[];
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function acknowledgeAlert(alert_id: number, acknowledged: boolean) {
  try {
    const res = await api.patch(`/alerts/${alert_id}`, { acknowledged });
    return res.data as AlertDTO;
  } catch (e) {
    throw extractApiError(e);
  }
}
