import { api } from './api';
import { extractApiError } from './errors';

export type WeatherDTO = {
  weather_id?: number;
  dive_id: number;
  surface_temperature?: number | null;
  wind_speed?: number | null;
  wave_height?: number | null;
  visibility_surface?: number | null;
  description?: string | null;
};

export async function upsertWeather(dive_id: number, body: Omit<WeatherDTO, 'weather_id' | 'dive_id'>) {
  try {
    const res = await api.put(`/weather/dives/${dive_id}/weather`, body);
    return res.data as WeatherDTO;
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function getWeather(dive_id: number) {
  try {
    const res = await api.get(`/weather/dives/${dive_id}/weather`);
    return res.data as WeatherDTO | null;
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function updateWeather(
  dive_id: number,
  body: Partial<Omit<WeatherDTO, 'weather_id' | 'dive_id'>>
) {
  try {
    const res = await api.put(`/weather/dives/${dive_id}/weather`, body);
    return res.data as WeatherDTO;
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function deleteWeather(dive_id: number) {
  try {
    await api.delete(`/weather/dives/${dive_id}/weather`);
  } catch (e) {
    throw extractApiError(e);
  }
}
