import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { bulkMeasurementsSchema } from "../schemas/measurements";
import { query } from "../db/pool";

const router = Router();

router.post(
  "/bulk/:dive_id",
  requireAuth,
  validate(bulkMeasurementsSchema),
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
      const items = (req as any).body as any[];
      if (!items.length) return res.status(201).json({ inserted: 0 });
      const values: string[] = [];
      const params: any[] = [];
      items.forEach((m, i) => {
        const base = i * 7;
        values.push(
          `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${
            base + 6
          },$${base + 7})`
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
      await query(
        `INSERT INTO "Measurement"(dive_id,timestamp,depth_current,temperature,ascent_speed,air_pressure,cumulative_ascent) VALUES ${values.join(
          ","
        )}`,
        params
      );
      res.status(201).json({ inserted: items.length });
    } catch (e) {
      next(e);
    }
  }
);

router.get("/dive/:dive_id", requireAuth, async (req, res, next) => {
  try {
    const uid = (req as any).user.user_id;
    const { dive_id } = (req as any).params;
    const { rows: d } = await query(
      'SELECT dive_id FROM "Dive" WHERE dive_id=$1 AND user_id=$2',
      [dive_id, uid]
    );
    if (!d) return res.status(404).json({ error: "Plongée introuvable" });
    const { from, to, page = "1", limit = "500" } = req.query as any;
    const p = Number(page),
      l = Math.min(Number(limit), 2000),
      offset = (p - 1) * l;
    const conds = ["dive_id=$1"];
    const params: any[] = [dive_id];
    if (from) {
      params.push(from);
      conds.push(`timestamp >= $${params.length}`);
    }
    if (to) {
      params.push(to);
      conds.push(`timestamp <= $${params.length}`);
    }
    params.push(l, offset);
    const sql = `SELECT * FROM "Measurement" WHERE ${conds.join(
      " AND "
    )} ORDER BY timestamp ASC LIMIT $${params.length - 1} OFFSET $${
      params.length
    }`;
    const { rows } = await query(sql, params);
    res.json({ page: p, limit: l, data: rows });
  } catch (e) {
    next(e);
  }
});

export default router;
