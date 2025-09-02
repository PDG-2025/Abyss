import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { syncDivePayloadSchema } from "../schemas/sync";
import pool  from "../db/pool";

const router = Router();

router.post(
  "/dive",
  requireAuth,
  validate(syncDivePayloadSchema),
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const uid = (req as any).user.user_id;
      const {
        dive,
        measurements = [],
        alerts = [],
        compass = [],
        weather,
        equipment,
        media = [],
      } = (req as any).body;

      const dRes = await client.query(
        `INSERT INTO "Dive"(user_id,device_id,location_id,gas_id,buddy_name,dive_purpose,entry_type,certification_level,visibility_underwater,notes,date,duration,depth_max,average_depth,ndl_limit)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING dive_id`,
        [
          uid,
          dive.device_id ?? null,
          dive.location_id ?? null,
          dive.gas_id ?? null,
          dive.buddy_name ?? null,
          dive.dive_purpose ?? null,
          dive.entry_type ?? null,
          dive.certification_level ?? null,
          dive.visibility_underwater ?? null,
          dive.notes ?? null,
          dive.date,
          dive.duration,
          dive.depth_max,
          dive.average_depth,
          dive.ndl_limit ?? null,
        ]
      );
      const dive_id = dRes.rows[0].dive_id;

      if (measurements.length) {
        const vals: string[] = [];
        const params: any[] = [];
        measurements.forEach((m: any, i: number) => {
          const base = i * 7;
          vals.push(
            `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${
              base + 5
            },$${base + 6},$${base + 7})`
          );
          params.push(
            dive_id,
            m.timestamp,
            m.depth_current,
            m.temperature ?? null,
            m.ascent_speed ?? null,
            m.air_pressure ?? null,
            m.cumulative_ascent ?? null
          );
        });
        await client.query(
          `INSERT INTO "Measurement"(dive_id,timestamp,depth_current,temperature,ascent_speed,air_pressure,cumulative_ascent) VALUES ${vals.join(
            ","
          )}`,
          params
        );
      }

      if (alerts.length) {
        const vals: string[] = [];
        const params: any[] = [];
        alerts.forEach((a: any, i: number) => {
          const base = i * 6;
          vals.push(
            `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${
              base + 5
            },$${base + 6})`
          );
          params.push(
            dive_id,
            a.code,
            a.message ?? null,
            a.severity ?? "LOW",
            a.acknowledged ?? false,
            a.timestamp
          );
        });
        await client.query(
          `INSERT INTO "Alert"(dive_id,code,message,severity,acknowledged,timestamp) VALUES ${vals.join(
            ","
          )}`,
          params
        );
      }

      if (compass.length) {
        const vals: string[] = [];
        const params: any[] = [];
        compass.forEach((c: any, i: number) => {
          const base = i * 3;
          vals.push(`($${base + 1},$${base + 2},$${base + 3})`);
          params.push(dive_id, c.timestamp, c.heading);
        });
        await client.query(
          `INSERT INTO "Compass"(dive_id,timestamp,heading) VALUES ${vals.join(
            ","
          )}`,
          params
        );
      }

      if (weather) {
        await client.query(
          `INSERT INTO "WeatherConditions"(dive_id,surface_temperature,wind_speed,wave_height,visibility_surface,description)
         VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            dive_id,
            weather.surface_temperature ?? null,
            weather.wind_speed ?? null,
            weather.wave_height ?? null,
            weather.visibility_surface ?? null,
            weather.description ?? null,
          ]
        );
      }

      if (equipment) {
        await client.query(
          `INSERT INTO "Equipment"(dive_id,wetsuit_thickness,tank_size,tank_pressure_start,tank_pressure_end,weights_used)
         VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            dive_id,
            equipment.wetsuit_thickness ?? null,
            equipment.tank_size ?? null,
            equipment.tank_pressure_start ?? null,
            equipment.tank_pressure_end ?? null,
            equipment.weights_used ?? null,
          ]
        );
      }

      if (media.length) {
        const vals: string[] = [];
        const params: any[] = [];
        media.forEach((m: any, i: number) => {
          const base = i * 5;
          vals.push(
            `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5})`
          );
          params.push(
            dive_id,
            m.media_type,
            m.url,
            m.description ?? null,
            m.timestamp_taken ?? null
          );
        });
        await client.query(
          `INSERT INTO "Media"(dive_id,media_type,url,description,timestamp_taken) VALUES ${vals.join(
            ","
          )}`,
          params
        );
      }

      await client.query("COMMIT");
      res.status(201).json({ dive_id });
    } catch (e) {
      await client.query("ROLLBACK");
      next(e);
    } finally {
      client.release();
    }
  }
);

export default router;
