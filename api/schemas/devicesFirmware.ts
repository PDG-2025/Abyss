import { z } from 'zod';

export const deviceFirmwareParamsSchema = z.object({
  device_id: z.coerce.number().int().positive(),
});

export const deviceFirmwareBodySchema = z.object({
  firmware_version: z.string().min(1, 'firmware_version requis'),
});

export type DeviceFirmwareParams = z.infer<typeof deviceFirmwareParamsSchema>;
export type DeviceFirmwareBody = z.infer<typeof deviceFirmwareBodySchema>;
