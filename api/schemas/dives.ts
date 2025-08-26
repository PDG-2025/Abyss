import { z } from "zod";
import { EntryKind, isoDateString, idParam, paginationQuery } from "./common";

export const createDiveSchema = z.object({
  body: z
    .object({
      device_id: z.number().int().positive().optional(),
      location_id: z.number().int().positive().optional(),
      gas_id: z.number().int().positive().optional(),
      buddy_name: z.string().max(100).optional(),
      dive_purpose: z.string().max(100).optional(),
      entry_type: EntryKind.optional(),
      certification_level: z.string().max(100).optional(),
      visibility_underwater: z.number().nonnegative().optional(),
      notes: z.string().optional(),
      date: isoDateString,
      duration: z.number().int().nonnegative(),
      depth_max: z.number().nonnegative(),
      average_depth: z.number().nonnegative(),
      ndl_limit: z.number().int().nonnegative().optional(),
    })
    .refine((d) => d.average_depth <= d.depth_max, {
      message: "average_depth ne peut pas dépasser depth_max",
      path: ["average_depth"],
    }),
});

export const updateDiveSchema = idParam.merge(
  z.object({
    body: z
      .object({
        device_id: z.number().int().positive().nullable().optional(),
        location_id: z.number().int().positive().nullable().optional(),
        gas_id: z.number().int().positive().nullable().optional(),
        buddy_name: z.string().max(100).optional(),
        dive_purpose: z.string().max(100).optional(),
        entry_type: EntryKind.optional(),
        certification_level: z.string().max(100).optional(),
        visibility_underwater: z.number().nonnegative().nullable().optional(),
        notes: z.string().nullable().optional(),
        date: isoDateString.optional(),
        duration: z.number().int().nonnegative().optional(),
        depth_max: z.number().nonnegative().optional(),
        average_depth: z.number().nonnegative().optional(),
        ndl_limit: z.number().int().nonnegative().nullable().optional(),
      })
      .refine(
        (d) =>
          d.depth_max == null ||
          d.average_depth == null ||
          d.average_depth <= d.depth_max,
        {
          message: "average_depth ne peut pas dépasser depth_max",
          path: ["average_depth"],
        }
      ),
  })
);

export const diveIdSchema = idParam;

export const listDivesSchema = paginationQuery.merge(
  z.object({
    query: z
      .object({
        from: isoDateString.optional(),
        to: isoDateString.optional(),
        device_id: z.coerce.number().int().positive().optional(),
        location_id: z.coerce.number().int().positive().optional(),
        gas_id: z.coerce.number().int().positive().optional(),
      })
      .partial(),
  })
);
