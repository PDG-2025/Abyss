import { z } from "zod";

export const idParam = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const diveIdParam = z.object({
  params: z.object({
    dive_id: z.coerce.number().int().positive(),
  }),
});

export const deviceIdParam = z.object({
  params: z.object({
    device_id: z.coerce.number().int().positive(),
  }),
});

export const paginationQuery = z.object({
  query: z
    .object({
      page: z.coerce.number().int().min(1).default(1).optional(),
      limit: z.coerce.number().int().min(1).max(200).default(50).optional(),
    })
    .default({}),
});

// Enums alignés au SQL proposé
export const EntryKind = z.enum(["shore", "boat", "pool", "other"]);
export const WaterKind = z.enum(["salt", "fresh", "brackish", "unknown"]);
export const MediaKind = z.enum(["image", "video"]);
export const AlertSeverity = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

// Date ISO -> string attendue
export const isoDateString = z
  .string()
  .refine((s) => !Number.isNaN(Date.parse(s)), {
    message: "Doit être une date ISO valide",
  });
