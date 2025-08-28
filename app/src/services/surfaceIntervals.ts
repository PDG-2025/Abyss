import { api } from './api';
import { extractApiError } from './errors';

export type SurfaceIntervalDTO = {
  interval_id: number;
  user_id: number;
  previous_dive_id?: number | null;
  interval_duration: number;
};

export async function createSurfaceInterval(body: { previous_dive_id?: number | null; interval_duration: number }) {
  try {
    const res = await api.post('/surface-intervals', body);
    return res.data as SurfaceIntervalDTO;
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function listSurfaceIntervals(page = 1, limit = 20) {
  try {
    const res = await api.get(`/surface-intervals?page=${page}&limit=${limit}`);
    return res.data as { page: number; limit: number; data: SurfaceIntervalDTO[] };
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function deleteSurfaceInterval(id: number) {
  try {
    await api.delete(`/surface-intervals/${id}`);
  } catch (e) {
    throw extractApiError(e);
  }
}
