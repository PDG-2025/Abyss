import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { upsertWeatherSchema } from "../schemas/weather";
import { query } from "../db/pool";

const router = Router();

router.put(
  "/dives/:dive_id/weather",
  requireAuth,
  validate(upsertWeatherSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const dive_id = Number(req.params.dive_id);
      if (Number.isNaN(dive_id)) {
        return res.status(400).json({ error: "Invalid dive_id" });
      }
      const b = (req as any).body;
      const { rows: d } = await query(
        'SELECT dive_id FROM "Dive" WHERE dive_id=$1 AND user_id=$2',
        [dive_id, uid]
      );
      if (!d) return res.status(404).json({ error: "Plongée introuvable" });
      const { rows } = await query(
        `INSERT INTO "WeatherConditions"(dive_id,surface_temperature,wind_speed,wave_height,visibility_surface,description)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (weather_id) DO NOTHING RETURNING *`, // pas de contrainte unique: on va faire upsert via delete/insert
        [
          dive_id,
          b.surface_temperature ?? null,
          b.wind_speed ?? null,
          b.wave_height ?? null,
          b.visibility_surface ?? null,
          b.description ?? null,
        ]
      );
      if (!rows) {
        // fallback upsert: delete + insert (1:1 par plongée)
        await query('DELETE FROM "WeatherConditions" WHERE dive_id=$1', [
          dive_id,
        ]);
        const rep = await query(
          `INSERT INTO "WeatherConditions"(dive_id,surface_temperature,wind_speed,wave_height,visibility_surface,description)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
          [
            dive_id,
            b.surface_temperature ?? null,
            b.wind_speed ?? null,
            b.wave_height ?? null,
            b.visibility_surface ?? null,
            b.description ?? null,
          ]
        );
        return res.json(rep.rows);
      }
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }
);

router.get("/dives/:dive_id/weather", requireAuth, async (req, res, next) => {
  try {
    const uid = (req as any).user.user_id;
    const { dive_id } = req.params;
    const { rows: d } = await query(
      'SELECT dive_id FROM "Dive" WHERE dive_id=$1 AND user_id=$2',
      [dive_id, uid]
    );
    if (!d) return res.status(404).json({ error: "Plongée introuvable" });
    const { rows } = await query(
      'SELECT * FROM "WeatherConditions" WHERE dive_id=$1',
      [dive_id]
    );
    res.json(rows ?? null);
  } catch (e) {
    next(e);
  }
});

router.delete(
  "/dives/:dive_id/weather",
  requireAuth,
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const dive_id = Number(req.params.dive_id);
      if (Number.isNaN(dive_id)) {
        return res.status(400).json({ error: "Invalid dive_id" });
      }
      const { rows: d } = await query(
        'SELECT dive_id FROM "Dive" WHERE dive_id=$1 AND user_id=$2',
        [dive_id, uid]
      );
      if (!d) return res.status(404).json({ error: "Plongée introuvable" });
      await query('DELETE FROM "WeatherConditions" WHERE dive_id=$1', [
        dive_id,
      ]);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

export default router;
