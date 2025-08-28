import { api } from './api';
import { extractApiError } from './errors';

export type MediaDTO = {
  media_id?: number;
  dive_id: number;
  media_type: 'image' | 'video';
  url: string;
  description?: string | null;
  timestamp_taken?: string | null;
  uploaded_date?: string | null;
};

export async function createMedia(dive_id: number, body: Omit<MediaDTO, 'media_id' | 'dive_id' | 'uploaded_date'>) {
  try {
    const res = await api.post(`/media/dives/${dive_id}/media`, body);
    return res.data as MediaDTO;
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function listMedia(dive_id: number, page = 1, limit = 20) {
  try {
    const res = await api.get(`/media/dives/${dive_id}/media?page=${page}&limit=${limit}`);
    return res.data as { page: number; limit: number; data: MediaDTO[] };
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function deleteMedia(media_id: number) {
  try {
    await api.delete(`/media/${media_id}`);
  } catch (e) {
    throw extractApiError(e);
  }
}
