import { api } from './api';
import { extractApiError } from './errors';

export type CompassDTO = {
  compass_id?: number;
  dive_id: number;
  timestamp: string;
  heading: number;
};

export async function bulkCompass(dive_id: number, items: Omit<CompassDTO, 'dive_id' | 'compass_id'>[]) {
  try {
    const res = await api.post(`/compass/bulk/${dive_id}`, items);
    return res.data as { inserted: number };
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function listCompass(dive_id: number, opts?: { from?: string; to?: string; page?: number; limit?: number }) {
  try {
    const qs = new URLSearchParams();
    if (opts?.from) qs.set('from', opts.from);
    if (opts?.to) qs.set('to', opts.to);
    if (opts?.page) qs.set('page', String(opts.page));
    if (opts?.limit) qs.set('limit', String(opts.limit));
    const res = await api.get(`/compass/dive/${dive_id}?` + qs.toString());
    return res.data as { page: number; limit: number; data: CompassDTO[] };
  } catch (e) {
    throw extractApiError(e);
  }
}
