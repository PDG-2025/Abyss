import { z } from "zod";
import { idParam, paginationQuery } from "./common";

export const createGasSchema = z.object({
  body: z
    .object({
      name: z.string().min(1).max(50),
      oxygen: z.number().min(0).max(100),
      nitrogen: z.number().min(0).max(100),
      helium: z.number().min(0).max(100),
    })
    .refine(
      (g) => Math.round((g.oxygen + g.nitrogen + g.helium) * 100) / 100 === 100,
      {
        message: "La somme O2+N2+He doit être 100",
        path: ["oxygen"],
      }
    ),
});

export const gasIdSchema = idParam;

export const listGasSchema = paginationQuery;
