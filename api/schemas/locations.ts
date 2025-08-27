import { z } from "zod";
import { idParam, paginationQuery, WaterKind } from "./common";

export const createLocationSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    water_type: WaterKind.optional(),
    certification_required: z.string().max(100).optional(),
  }),
});

export const updateLocationSchema = idParam.merge(
  z.object({
    body: z.object({
      name: z.string().min(1).max(100).optional(),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      water_type: WaterKind.optional(),
      certification_required: z.string().max(100).optional(),
    }),
  })
);

export const locationIdSchema = idParam;

export const listLocationsSchema = paginationQuery;
