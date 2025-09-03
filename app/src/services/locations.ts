import { api } from './api';
import { extractApiError } from './errors';

export type LocationItem = {
  location_id: number;
  name: string;
  latitude: number;
  longitude: number;
  certification_required?: string;
  water_type?: string;
};

export async function listLocations(params?: { page?: number; limit?: number }) {
  try {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const res = await api.get(`/locations?${qs.toString()}`);
    return res.data as LocationItem[];
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function getLocation(location_id: number) {
  try {
    const res = await api.get(`/locations/${location_id}`);
    return res.data as LocationItem;
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function getLocationsBulk(ids: number[]) {
  try {
    if (ids.length === 0) return [];
    const res = await api.get(`/locations?ids=${ids.join(',')}`);
    return res.data as LocationItem[];
  } catch (e) {
    throw extractApiError(e);
  }
}
export async function updateLocation(location_id: number, data: Partial<LocationItem>) {
  try {
    const res = await api.patch(`/locations/${location_id}`, data);
    return res.data as LocationItem;
  } catch (e) {
    throw extractApiError(e);
  }
}
