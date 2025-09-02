import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createSurfaceIntervalSchema,
  listSurfaceIntervalsSchema,
  surfaceIntervalIdSchema,
} from "../schemas/surfaceIntervals";
import { query } from "../db/pool";

const router = Router();

router.post(
  "/",
  requireAuth,
  validate(createSurfaceIntervalSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const b = (req as any).body;
      const { rows } = await query(
        'INSERT INTO "SurfaceInterval"(user_id,previous_dive_id,interval_duration) VALUES ($1,$2,$3) RETURNING *',
        [uid, b.previous_dive_id ?? null, b.interval_duration]
      );
      res.status(201).json(rows);
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/",
  requireAuth,
  validate(listSurfaceIntervalsSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const page = Number((req as any).query.page ?? 1),
        limit = Number((req as any).query.limit ?? 50),
        offset = (page - 1) * limit;
      const { rows } = await query(
        'SELECT * FROM "SurfaceInterval" WHERE user_id=$1 ORDER BY interval_id DESC LIMIT $2 OFFSET $3',
        [uid, limit, offset]
      );
      res.json({ page, limit, data: rows });
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  "/:id",
  requireAuth,
  validate(surfaceIntervalIdSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const { id } = (req as any).params;
      const { rowCount } = await query(
        'DELETE FROM "SurfaceInterval" WHERE interval_id=$1 AND user_id=$2',
        [id, uid]
      );
      if (!rowCount)
        return res.status(404).json({ error: "Intervalle introuvable" });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

export default router;
