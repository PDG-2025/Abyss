import { api } from './api';
import { extractApiError } from './errors';
import type { MeasurementDTO } from './measurements';
import type { AlertDTO } from './alerts';
import type { CompassDTO } from './compass';
import type { WeatherDTO } from './weather';
import type { EquipmentDTO } from './equipment';
import type { MediaDTO } from './media';

export type SyncDivePayload = {
  dive: {
    device_id?: number | null;
    location_id?: number | null;
    gas_id?: number | null;
    buddy_name?: string | null;
    entry_type?: 'shore' | 'boat' | 'pool' | 'other' | null;
    certification_level?: string | null;
    visibility_underwater?: number | null;
    notes?: string | null;
    date: string;
    duration: number;
    depth_max: number;
    average_depth: number;
    ndl_limit?: number | null;
  };
  measurements?: Omit<MeasurementDTO, 'dive_id' | 'measurement_id'>[];
  alerts?: Omit<AlertDTO, 'dive_id' | 'alert_id'>[];
  compass?: Omit<CompassDTO, 'dive_id' | 'compass_id'>[];
  weather?: Omit<WeatherDTO, 'weather_id' | 'dive_id'>;
  equipment?: Omit<EquipmentDTO, 'equipment_id' | 'dive_id'>;
  media?: Omit<MediaDTO, 'media_id' | 'dive_id' | 'uploaded_date'>[];
};

export async function syncDive(payload: SyncDivePayload) {
  try {
    const res = await api.post('/sync/dive', payload);
    return res.data as { dive_id: number };
  } catch (e) {
    throw extractApiError(e);
  }
}
