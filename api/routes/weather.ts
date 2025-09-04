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

      // Vérifier que la plongée appartient bien à l'utilisateur
      const { rows: diveRows } = await query(
        'SELECT dive_id FROM "Dive" WHERE dive_id=$1 AND user_id=$2',
        [dive_id, uid]
      );
      if (!diveRows || diveRows.length === 0) {
        return res.status(404).json({ error: "Plongée introuvable" });
      }

      // Vérifier si une météo existe déjà pour cette plongée
      const { rows: existingRows } = await query(
        'SELECT weather_id FROM "WeatherConditions" WHERE dive_id=$1',
        [dive_id]
      );

      let result;
      if (existingRows.length > 0) {
        // UPDATE uniquement les champs fournis
        const setClauses: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if ("surface_temperature" in b) {
          setClauses.push(`surface_temperature = $${idx++}`);
          values.push(b.surface_temperature);
        }
        if ("wind_speed" in b) {
          setClauses.push(`wind_speed = $${idx++}`);
          values.push(b.wind_speed);
        }
        if ("wave_height" in b) {
          setClauses.push(`wave_height = $${idx++}`);
          values.push(b.wave_height);
        }
        if ("visibility_surface" in b) {
          setClauses.push(`visibility_surface = $${idx++}`);
          values.push(b.visibility_surface);
        }
        if ("description" in b) {
          setClauses.push(`description = $${idx++}`);
          values.push(b.description);
        }

        if (setClauses.length === 0) {
          // Rien à mettre à jour
          const { rows } = await query(
            'SELECT * FROM "WeatherConditions" WHERE dive_id=$1',
            [dive_id]
          );
          result = rows[0];
        } else {
          const sql = `UPDATE "WeatherConditions"
                 SET ${setClauses.join(", ")}
                 WHERE dive_id = $${idx}
                 RETURNING *`;
          values.push(dive_id);
          const { rows } = await query(sql, values);
          result = rows[0];
        }
      } else {
        // INSERT complet si aucune météo existante
        const { rows } = await query(
          `INSERT INTO "WeatherConditions"
     (dive_id, surface_temperature, wind_speed, wave_height, visibility_surface, description)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
          [
            dive_id,
            b.surface_temperature ?? null,
            b.wind_speed ?? null,
            b.wave_height ?? null,
            b.visibility_surface ?? null,
            b.description ?? null,
          ]
        );
        result = rows[0];
      }

      res.json(result);
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
    res.json(rows[0] ?? null);
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
