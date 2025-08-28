import { api } from './api';
import { extractApiError } from './errors';

export type EquipmentDTO = {
  equipment_id?: number;
  dive_id: number;
  wetsuit_thickness?: number | null;
  tank_size?: number | null;
  tank_pressure_start?: number | null;
  tank_pressure_end?: number | null;
  weights_used?: number | null;
};

export async function upsertEquipment(dive_id: number, body: Omit<EquipmentDTO, 'equipment_id' | 'dive_id'>) {
  try {
    const res = await api.put(`/equipment/dives/${dive_id}/equipment`, body);
    return res.data as EquipmentDTO;
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function getEquipment(dive_id: number) {
  try {
    const res = await api.get(`/equipment/dives/${dive_id}/equipment`);
    return res.data as EquipmentDTO | null;
  } catch (e) {
    throw extractApiError(e);
  }
}

export async function deleteEquipment(dive_id: number) {
  try {
    await api.delete(`/equipment/dives/${dive_id}/equipment`);
  } catch (e) {
    throw extractApiError(e);
  }
}
