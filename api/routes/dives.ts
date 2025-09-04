import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { listDivesSchema, diveIdSchema } from "../schemas/dives";
import { query } from "../db/pool";

const router = Router();

/**
 * GET /dives : liste complète avec relations
 */
router.get(
  "/",
  requireAuth,
  validate(listDivesSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const q = req.query;
      const page = Number(q.page ?? 1);
      const limit = Number(q.limit ?? 50);
      const offset = (page - 1) * limit;

      const filters: string[] = ['d."user_id" = $1'];
      const params: any[] = [uid];

      if (q.from) {
        params.push(q.from);
        filters.push(`d.date >= $${params.length}`);
      }
      if (q.to) {
        params.push(q.to);
        filters.push(`d.date <= $${params.length}`);
      }
      if (q.device_id) {
        params.push(q.device_id);
        filters.push(`d.device_id = $${params.length}`);
      }
      if (q.location_id) {
        params.push(q.location_id);
        filters.push(`d.location_id = $${params.length}`);
      }
      if (q.gas_id) {
        params.push(q.gas_id);
        filters.push(`d.gas_id = $${params.length}`);
      }

      params.push(limit, offset);

      const sql = `
SELECT d.*, 
       l.name AS location_name, l.latitude, l.longitude, l.water_type, l.certification_required,
       w.surface_temperature, w.wind_speed, w.wave_height, w.visibility_surface, w.description AS weather_desc,
       e.wetsuit_thickness, e.tank_size, e.tank_pressure_start, e.tank_pressure_end, e.weights_used,
       COALESCE(json_agg(DISTINCT jsonb_build_object('media_id', m.media_id, 'url', m.url, 'type', m.media_type, 'desc', m.description, 'timestamp', m.timestamp_taken)) FILTER (WHERE m.media_id IS NOT NULL), '[]') AS medias,
       COALESCE(json_agg(DISTINCT jsonb_build_object('alert_id', a.alert_id, 'code', a.code, 'message', a.message, 'severity', a.severity, 'timestamp', a.timestamp)) FILTER (WHERE a.alert_id IS NOT NULL), '[]') AS alerts,
       COALESCE(json_agg(DISTINCT jsonb_build_object('stop_id', s.stop_id, 'depth', s.depth, 'duration', s.duration)) FILTER (WHERE s.stop_id IS NOT NULL), '[]') AS stops,
       COALESCE(json_agg(DISTINCT jsonb_build_object('compass_id', c.compass_id, 'timestamp', c.timestamp, 'heading', c.heading)) FILTER (WHERE c.compass_id IS NOT NULL), '[]') AS compass,
       COALESCE(json_agg(DISTINCT jsonb_build_object('measurement_id', me.measurement_id, 'timestamp', me.timestamp, 'depth', me.depth_current, 'temp', me.temperature, 'ascent_speed', me.ascent_speed)) FILTER (WHERE me.measurement_id IS NOT NULL), '[]') AS measurements
FROM "Dive" d
LEFT JOIN "Location" l ON d.location_id = l.location_id
LEFT JOIN "WeatherConditions" w ON w.dive_id = d.dive_id
LEFT JOIN "Equipment" e ON e.dive_id = d.dive_id
LEFT JOIN "Media" m ON m.dive_id = d.dive_id
LEFT JOIN "Alert" a ON a.dive_id = d.dive_id
LEFT JOIN "DecompressionStop" s ON s.dive_id = d.dive_id
LEFT JOIN "Compass" c ON c.dive_id = d.dive_id
LEFT JOIN "Measurement" me ON me.dive_id = d.dive_id
WHERE ${filters.join(" AND ")}
GROUP BY d.dive_id, l.location_id, w.weather_id, e.equipment_id
ORDER BY d.date DESC
LIMIT $${params.length - 1} OFFSET $${params.length};
    `;

      const { rows } = await query(sql, params);
      res.json({ page, limit, data: rows });
    } catch (e) {
      next(e);
    }
  }
);

/**
 * GET /dives/:id : une plongée avec tout
 */
router.get(
  "/:id",
  requireAuth,
  validate(diveIdSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const id = Number(req.params.id);
      if (Number.isNaN(id))
        return res.status(400).json({ error: "Invalid dive_id" });

      const sql = `
SELECT d.*, 
       l.name AS location_name, l.latitude, l.longitude, l.water_type, l.certification_required,
       w.surface_temperature, w.wind_speed, w.wave_height, w.visibility_surface, w.description AS weather_desc,
       e.wetsuit_thickness, e.tank_size, e.tank_pressure_start, e.tank_pressure_end, e.weights_used,
       COALESCE(json_agg(DISTINCT jsonb_build_object('media_id', m.media_id, 'url', m.url, 'type', m.media_type, 'desc', m.description, 'timestamp', m.timestamp_taken)) FILTER (WHERE m.media_id IS NOT NULL), '[]') AS medias,
       COALESCE(json_agg(DISTINCT jsonb_build_object('alert_id', a.alert_id, 'code', a.code, 'message', a.message, 'severity', a.severity, 'timestamp', a.timestamp)) FILTER (WHERE a.alert_id IS NOT NULL), '[]') AS alerts,
       COALESCE(json_agg(DISTINCT jsonb_build_object('stop_id', s.stop_id, 'depth', s.depth, 'duration', s.duration)) FILTER (WHERE s.stop_id IS NOT NULL), '[]') AS stops,
       COALESCE(json_agg(DISTINCT jsonb_build_object('compass_id', c.compass_id, 'timestamp', c.timestamp, 'heading', c.heading)) FILTER (WHERE c.compass_id IS NOT NULL), '[]') AS compass,
       COALESCE(json_agg(DISTINCT jsonb_build_object('measurement_id', me.measurement_id, 'timestamp', me.timestamp, 'depth', me.depth_current, 'temp', me.temperature, 'ascent_speed', me.ascent_speed)) FILTER (WHERE me.measurement_id IS NOT NULL), '[]') AS measurements
FROM "Dive" d
LEFT JOIN "Location" l ON d.location_id = l.location_id
LEFT JOIN "WeatherConditions" w ON w.dive_id = d.dive_id
LEFT JOIN "Equipment" e ON e.dive_id = d.dive_id
LEFT JOIN "Media" m ON m.dive_id = d.dive_id
LEFT JOIN "Alert" a ON a.dive_id = d.dive_id
LEFT JOIN "DecompressionStop" s ON s.dive_id = d.dive_id
LEFT JOIN "Compass" c ON c.dive_id = d.dive_id
LEFT JOIN "Measurement" me ON me.dive_id = d.dive_id
WHERE d.dive_id=$1 AND d.user_id=$2
GROUP BY d.dive_id, l.location_id, w.weather_id, e.equipment_id
    `;
      const { rows } = await query(sql, [id, uid]);
      if (!rows.length)
        return res.status(404).json({ error: "Dive not found" });

      res.json(rows[0]);
    } catch (e) {
      next(e);
    }
  }
);

/**
 * PATCH /dives/:id : modification partielle
 */
router.patch("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const validColumns = [
    "user_id",
    "device_id",
    "location_id",
    "gas_id",
    "buddy_name",
    "dive_purpose",
    "entry_type",
    "certification_level",
    "visibility_underwater",
    "notes",
    "date",
    "duration",
    "depth_max",
    "average_depth",
    "ndl_limit",
  ];
  const data = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => validColumns.includes(key))
  );

  try {
    if (Object.keys(data).length === 0) {
      return res
        .status(400)
        .json({ message: "Aucun champ valide à mettre à jour" });
    }

    const setClauses = [];
    const values = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      setClauses.push(`${key} = $${idx}`);
      values.push(value);
      idx++;
    }

    values.push(id);
    const sql = `UPDATE "Dive" SET ${setClauses.join(
      ", "
    )} WHERE dive_id = $${idx} RETURNING *;`;

    const result = await query(sql, values);
    if (result.rowCount === 0)
      return res.status(404).json({ message: "Plongée introuvable" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur PATCH /dives/:id", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

/**
 * DELETE /dives/:id : suppression
 */
router.delete(
  "/:id",
  requireAuth,
  validate(diveIdSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const id = Number(req.params.id);
      if (Number.isNaN(id))
        return res.status(400).json({ error: "Invalid dive_id" });

      const { rowCount } = await query(
        `DELETE FROM "Dive" WHERE dive_id=$1 AND user_id=$2`,
        [id, uid]
      );
      if (rowCount === 0)
        return res.status(404).json({ error: "Dive not found" });

      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

export default router;
