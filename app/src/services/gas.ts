import { api } from "./api";
import { extractApiError } from "./errors";

export type GasDTO = {
  gas_id: number;
  name: string;
  oxygen: number;
  nitrogen: number;
  helium: number;
};

// Récupérer le gaz utilisé pour une plongée
export async function getGas(dive_id: number) {
  try {
    const res = await api.get(`/dives/${dive_id}/gas`);
    return res.data as GasDTO | null;
  } catch (e) {
    return null;
  }
}
