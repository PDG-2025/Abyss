import { z } from "zod";
import { paginationQuery } from "./common";

export const getMeSchema = z.object({}); // rien à valider

export const listUserDivesSchema = paginationQuery;

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
  }),
});
