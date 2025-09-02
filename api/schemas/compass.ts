import { z } from 'zod';
import { diveIdParam } from './common';

const compassItem = z.object({
  timestamp: z.string().datetime(),
  heading: z.number().min(0).max(359.9999),
});

export const bulkCompassSchema = diveIdParam.merge(z.object({
  body: z.array(compassItem).max(10000),
}));
