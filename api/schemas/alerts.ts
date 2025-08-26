import { z } from "zod";
import { diveIdParam, AlertSeverity } from "./common";

const alertItem = z.object({
  code: z.string().min(1).max(50),
  message: z.string().max(255).nullable().optional(),
  severity: AlertSeverity.default("LOW").optional(),
  acknowledged: z.boolean().default(false).optional(),
  timestamp: z.string().datetime(),
});

export const bulkAlertsSchema = diveIdParam.merge(
  z.object({
    body: z.array(alertItem).max(5000),
  })
);

export const acknowledgeAlertSchema = z.object({
  params: z.object({
    alert_id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    acknowledged: z.boolean(),
  }),
});
