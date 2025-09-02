import { api } from './api';
import { extractApiError } from './errors';
import type { Dive, Paged } from '../types/dto';

export async function listDives(params: { page?: number; limit?: number; from?: string; to?: string; device_id?: number; location_id?: number; gas_id?: number }) {
  try {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.from) qs.set('from', params.from);
    if (params.to) qs.set('to', params.to);
    if (params.device_id) qs.set('device_id', String(params.device_id));
    if (params.location_id) qs.set('location_id', String(params.location_id));
    if (params.gas_id) qs.set('gas_id', String(params.gas_id));
    const res = await api.get(`/dives?${qs.toString()}`);
    return res.data as Paged<Dive>;
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function getDive(dive_id: number) {
  try {
    const res = await api.get(`/dives/${dive_id}`);
    return res.data as Dive;
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function createDive(body: Partial<Dive> & { date: string; duration: number; depth_max: number; average_depth: number }) {
  try {
    const res = await api.post('/dives', body);
    return res.data as Dive;
  } catch (e) {
    throw extractApiError(e);
  }
}
export async function listMeasurements(
  dive_id: number,
  opts?: { from?: string; to?: string; page?: number; limit?: number }
): Promise<{ page?: number; limit?: number; data: Array<{
  timestamp: string;
  depth_current: number;
  temperature?: number | null;
  ascent_speed?: number | null;
  air_pressure?: number | null;
  cumulative_ascent?: number | null;
}> }> {
  try {
    const qs = new URLSearchParams();
    if (opts?.from) qs.set('from', opts.from);
    if (opts?.to) qs.set('to', opts.to);
    if (opts?.page) qs.set('page', String(opts.page));
    if (opts?.limit) qs.set('limit', String(opts.limit));
    const res = await api.get(`/dives/${dive_id}/measurements${qs.toString() ? `?${qs.toString()}` : ''}`);
   
    return res.data;
  } catch (e) {
    throw extractApiError(e);
  }
}

// Mise à jour partielle d’une plongée (PATCH /dives/:id)
export async function updateDive(
  dive_id: number,
  body: Partial<Pick<
    Dive,
    | 'date'
    | 'duration'
    | 'depth_max'
    | 'average_depth'
    | 'ndl_limit'
    | 'buddy_name'
    | 'dive_purpose'
    | 'entry_type'
    | 'certification_level'
    | 'visibility_underwater'
    | 'notes'
    | 'device_id'
    | 'location_id'
    | 'gas_id'
  >>
): Promise<Dive> {
  try {
    const res = await api.patch(`/dives/${dive_id}`, body);
    
    return res.data as Dive;
  } catch (e) {
    throw extractApiError(e);
  }
}
