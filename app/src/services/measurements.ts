import { api } from './api';
import { extractApiError } from './errors';

export type MeasurementDTO = {
  measurement_id?: number;
  dive_id: number;
  timestamp: string;
  depth_current: number;
  temperature?: number | null;
  ascent_speed?: number | null;
  air_pressure?: number | null;
  cumulative_ascent?: number | null;
};

export async function bulkMeasurements(dive_id: number, items: Omit<MeasurementDTO, 'dive_id' | 'measurement_id'>[]) {
  try {
    const res = await api.post(`/measurements/bulk/${dive_id}`, items);
    return res.data as { inserted: number };
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function listMeasurements(dive_id: number, opts?: { from?: string; to?: string; page?: number; limit?: number }) {
  try {
    const qs = new URLSearchParams();
    if (opts?.from) qs.set('from', opts.from);
    if (opts?.to) qs.set('to', opts.to);
    if (opts?.page) qs.set('page', String(opts.page));
    if (opts?.limit) qs.set('limit', String(opts.limit));
    const res = await api.get(`/measurements/dive/${dive_id}?` + qs.toString());
    return res.data as { page: number; limit: number; data: MeasurementDTO[] };
  } catch (e) {
    throw extractApiError(e);
  }
}
