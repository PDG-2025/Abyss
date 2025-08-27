import { z } from "zod";
import { diveIdParam } from "./common";

const measurementItem = z.object({
  timestamp: z.string().datetime(),
  depth_current: z.number().nonnegative(),
  temperature: z.number().nullable().optional(),
  ascent_speed: z.number().nonnegative().nullable().optional(),
  air_pressure: z.number().nonnegative().nullable().optional(),
  cumulative_ascent: z.number().nonnegative().nullable().optional(),
});

export const bulkMeasurementsSchema = diveIdParam.merge(
  z.object({
    body: z.array(measurementItem).max(10000),
  })
);
