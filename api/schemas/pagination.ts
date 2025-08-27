import { z } from "zod";

export const listQueryWithSort = z.object({
  query: z
    .object({
      page: z.coerce.number().int().min(1).default(1).optional(),
      limit: z.coerce.number().int().min(1).max(200).default(50).optional(),
      sort: z.enum(["asc", "desc"]).default("desc").optional(),
    })
    .default({}),
});
