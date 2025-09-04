import { api } from "./api";
import { extractApiError } from "./errors";

export type DecompressionStopDTO = {
  stop_id: number;
  dive_id: number;
  depth: number;
  duration: number;
};

// Récupérer les paliers de décompression
export async function listDecompressionStops(dive_id: number) {
  try {
    const res = await api.get(`/dives/${dive_id}/stops`);
    // Toujours retourner un tableau, même si vide
    return (res.data as DecompressionStopDTO[]) || [];
  } catch (e) {
    return [];
  }
}
