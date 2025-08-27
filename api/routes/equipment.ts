import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { upsertEquipmentSchema } from "../schemas/equipment";
import { query } from "../db/pool";

const router = Router();

router.put(
  "/dives/:dive_id/equipment",
  requireAuth,
  validate(upsertEquipmentSchema),
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
      await query('DELETE FROM "Equipment" WHERE dive_id=$1', [dive_id]);
      const { rows } = await query(
        `INSERT INTO "Equipment"(dive_id,wetsuit_thickness,tank_size,tank_pressure_start,tank_pressure_end,weights_used)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [
          dive_id,
          b.wetsuit_thickness ?? null,
          b.tank_size ?? null,
          b.tank_pressure_start ?? null,
          b.tank_pressure_end ?? null,
          b.weights_used ?? null,
        ]
      );
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }
);

router.get("/dives/:dive_id/equipment", requireAuth, async (req, res, next) => {
  try {
    const uid = (req as any).user.user_id;
    const { dive_id } = req.params;
    const { rows: d } = await query(
      'SELECT dive_id FROM "Dive" WHERE dive_id=$1 AND user_id=$2',
      [dive_id, uid]
    );
    if (!d) return res.status(404).json({ error: "Plongée introuvable" });
    const { rows } = await query('SELECT * FROM "Equipment" WHERE dive_id=$1', [
      dive_id,
    ]);
    res.json(rows ?? null);
  } catch (e) {
    next(e);
  }
});

router.delete(
  "/dives/:dive_id/equipment",
  requireAuth,
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const { dive_id } = req.params;
      const { rows: d } = await query(
        'SELECT dive_id FROM "Dive" WHERE dive_id=$1 AND user_id=$2',
        [dive_id, uid]
      );
      if (!d) return res.status(404).json({ error: "Plongée introuvable" });
      await query('DELETE FROM "Equipment" WHERE dive_id=$1', [dive_id]);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

export default router;
