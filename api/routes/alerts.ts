import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { bulkAlertsSchema, acknowledgeAlertSchema } from "../schemas/alerts";
import { query } from "../db/pool";

const router = Router();

router.post(
  "/bulk/:dive_id",
  requireAuth,
  validate(bulkAlertsSchema),
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
      items.forEach((a, i) => {
        const base = i * 6;
        values.push(
          `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${
            base + 6
          })`
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
      await query(
        `INSERT INTO "Alert"(dive_id,code,message,severity,acknowledged,timestamp) VALUES ${values.join(
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
    const { severity, from, to } = req.query as any;
    const conds = ["dive_id=$1"];
    const params: any[] = [dive_id];
    if (severity) {
      params.push(severity);
      conds.push(`severity=$${params.length}`);
    }
    if (from) {
      params.push(from);
      conds.push(`timestamp >= $${params.length}`);
    }
    if (to) {
      params.push(to);
      conds.push(`timestamp <= $${params.length}`);
    }
    const { rows } = await query(
      `SELECT * FROM "Alert" WHERE ${conds.join(
        " AND "
      )} ORDER BY timestamp ASC`,
      params
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.patch(
  "/:alert_id",
  requireAuth,
  validate(acknowledgeAlertSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const { alert_id } = (req as any).params;
      // Ownership via join
      const { rows: a } = await query(
        `UPDATE "Alert" AS a
       SET acknowledged = $1
       FROM "Dive" d
       WHERE a.alert_id=$2 AND a.dive_id=d.dive_id AND d.user_id=$3
       RETURNING a.*`,
        [(req as any).body.acknowledged, alert_id, uid]
      );
      if (!a) return res.status(404).json({ error: "Alerte introuvable" });
      res.json(a);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
