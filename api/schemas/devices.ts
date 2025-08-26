import { z } from "zod";
import { deviceIdParam, paginationQuery } from "./common";

export const createDeviceSchema = z.object({
  body: z.object({
    serial_number: z.string().min(1).max(100),
    model: z.string().min(1).max(100),
    firmware_version: z.string().min(1).max(50),
  }),
});

export const updateDeviceSchema = deviceIdParam.merge(
  z.object({
    body: z.object({
      model: z.string().min(1).max(100).optional(),
      firmware_version: z.string().min(1).max(50).optional(),
    }),
  })
);

export const deviceIdSchema = deviceIdParam;

export const listDeviceDivesSchema = deviceIdParam.merge(paginationQuery);

export const createBatteryStatusSchema = deviceIdParam.merge(
  z.object({
    body: z.object({
      percentage: z.number().int().min(0).max(100),
      status_date: z.string().datetime().optional(), // ISO, sinon default NOW côté SQL
    }),
  })
);
