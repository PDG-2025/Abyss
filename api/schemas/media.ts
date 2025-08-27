import { z } from "zod";
import { MediaKind, diveIdParam, paginationQuery } from "./common";

export const createMediaSchema = diveIdParam.merge(
  z.object({
    body: z.object({
      media_type: MediaKind,
      url: z.string().url().max(255),
      description: z.string().max(255).optional(),
      timestamp_taken: z.string().datetime().optional(),
    }),
  })
);

export const listMediaForDiveSchema = diveIdParam.merge(paginationQuery);
