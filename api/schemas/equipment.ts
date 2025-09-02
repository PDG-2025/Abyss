import { z } from "zod";
import { diveIdParam } from "./common";

export const upsertEquipmentSchema = diveIdParam.merge(
  z.object({
    body: z.object({
      wetsuit_thickness: z.number().nullable().optional(),
      tank_size: z.number().nullable().optional(),
      tank_pressure_start: z.number().nonnegative().nullable().optional(),
      tank_pressure_end: z.number().nonnegative().nullable().optional(),
      weights_used: z.number().nullable().optional(),
    }),
  })
);
