import { z } from "zod";
import { EntryKind, AlertSeverity, MediaKind, isoDateString } from "./common";

const diveSchema = z
  .object({
    device_id: z.number().int().positive().nullable().optional(),
    location_id: z.number().int().positive().nullable().optional(),
    gas_id: z.number().int().positive().nullable().optional(),
    buddy_name: z.string().max(100).nullable().optional(),
    dive_purpose: z.string().max(100).nullable().optional(),
    entry_type: EntryKind.nullable().optional(),
    certification_level: z.string().max(100).nullable().optional(),
    visibility_underwater: z.number().nonnegative().nullable().optional(),
    notes: z.string().nullable().optional(),
    date: isoDateString,
    duration: z.number().int().nonnegative(),
    depth_max: z.number().nonnegative(),
    average_depth: z.number().nonnegative(),
    ndl_limit: z.number().int().nonnegative().nullable().optional(),
  })
  .refine((d) => d.average_depth <= d.depth_max, {
    message: "average_depth ne peut pas dépasser depth_max",
    path: ["average_depth"],
  });

const measurementItem = z.object({
  timestamp: z.string().datetime(),
  depth_current: z.number().nonnegative(),
  temperature: z.number().nullable().optional(),
  ascent_speed: z.number().nonnegative().nullable().optional(),
  air_pressure: z.number().nonnegative().nullable().optional(),
  cumulative_ascent: z.number().nonnegative().nullable().optional(),
});

const alertItem = z.object({
  code: z.string().min(1).max(50),
  message: z.string().max(255).nullable().optional(),
  severity: AlertSeverity.default("LOW").optional(),
  acknowledged: z.boolean().default(false).optional(),
  timestamp: z.string().datetime(),
});

const compassItem = z.object({
  timestamp: z.string().datetime(),
  heading: z.number().min(0).max(359.9999),
});

const weatherSchema = z
  .object({
    surface_temperature: z.number().nullable().optional(),
    wind_speed: z.number().nullable().optional(),
    wave_height: z.number().nullable().optional(),
    visibility_surface: z.number().nullable().optional(),
    description: z.string().max(255).nullable().optional(),
  })
  .optional();

const equipmentSchema = z
  .object({
    wetsuit_thickness: z.number().nullable().optional(),
    tank_size: z.number().nullable().optional(),
    tank_pressure_start: z.number().nonnegative().nullable().optional(),
    tank_pressure_end: z.number().nonnegative().nullable().optional(),
    weights_used: z.number().nullable().optional(),
  })
  .optional();

const mediaItem = z.object({
  media_type: MediaKind,
  url: z.string().url().max(255),
  description: z.string().max(255).nullable().optional(),
  timestamp_taken: z.string().datetime().nullable().optional(),
});

export const syncDivePayloadSchema = z.object({
  body: z.object({
    dive: diveSchema,
    measurements: z.array(measurementItem).max(10000).default([]).optional(),
    alerts: z.array(alertItem).max(5000).default([]).optional(),
    compass: z.array(compassItem).max(10000).default([]).optional(),
    weather: weatherSchema,
    equipment: equipmentSchema,
    media: z.array(mediaItem).max(2000).default([]).optional(),
  }),
});
