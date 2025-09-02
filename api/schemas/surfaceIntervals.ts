import { z } from "zod";
import { idParam, paginationQuery } from "./common";

export const createSurfaceIntervalSchema = z.object({
  body: z.object({
    previous_dive_id: z.number().int().positive().optional(), // nullable côté DB accepté via handler
    interval_duration: z.number().int().nonnegative(),
  }),
});

export const listSurfaceIntervalsSchema = paginationQuery;

export const surfaceIntervalIdSchema = idParam;
