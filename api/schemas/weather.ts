import { z } from "zod";
import { diveIdParam } from "./common";

export const upsertWeatherSchema = diveIdParam.merge(
  z.object({
    body: z.object({
      surface_temperature: z.number().nullable().optional(),
      wind_speed: z.number().nullable().optional(),
      wave_height: z.number().nullable().optional(),
      visibility_surface: z.number().nullable().optional(),
      description: z.string().max(255).nullable().optional(),
    }),
  })
);
