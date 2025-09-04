import { z } from 'zod';

export const latestFirmwareQuerySchema = z.object({
  model: z.string().min(1, 'model requis'),
});

export type LatestFirmwareQuery = z.infer<typeof latestFirmwareQuerySchema>;
