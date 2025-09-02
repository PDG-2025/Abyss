import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { bulkCompassSchema } from "../schemas/compass";
import { query } from "../db/pool";

const router = Router();

router.post(
  "/bulk/:dive_id",
  requireAuth,
  validate(bulkCompassSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const { dive_id } = (req as any).params;
      const { rows: d } = await query(
        'SELECT dive_id FROM "Dive" WHERE dive_id=$1 AND user_id=$2',
        [dive_id, uid]
      );
      if (!d) return res.status(404).json({ error: "Plongée introuvable" });
      const items = (req as any).body as any[];
      if (!items.length) return res.status(201).json({ inserted: 0 });
      const values: string[] = [];
      const params: any[] = [];
      items.forEach((c, i) => {
        const base = i * 3;
        values.push(`($${base + 1},$${base + 2},$${base + 3})`);
        params.push(dive_id, c.timestamp, c.heading);
      });
      await query(
        `INSERT INTO "Compass"(dive_id,timestamp,heading) VALUES ${values.join(
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
    const { from, to, page = "1", limit = "2000" } = req.query as any;
    const p = Number(page),
      l = Math.min(Number(limit), 5000),
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
    const sql = `SELECT * FROM "Compass" WHERE ${conds.join(
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
