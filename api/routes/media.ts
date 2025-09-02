import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createMediaSchema, listMediaForDiveSchema } from "../schemas/media";
import { query } from "../db/pool";

const router = Router();

router.post(
  "/dives/:dive_id/media",
  requireAuth,
  validate(createMediaSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const { dive_id } = (req as any).params;
      const b = (req as any).body;
      const { rows: d } = await query(
        'SELECT dive_id FROM "Dive" WHERE dive_id=$1 AND user_id=$2',
        [dive_id, uid]
      );
      if (!d) return res.status(404).json({ error: "Plongée introuvable" });
      const { rows } = await query(
        'INSERT INTO "Media"(dive_id,media_type,url,description,timestamp_taken) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [
          dive_id,
          b.media_type,
          b.url,
          b.description ?? null,
          b.timestamp_taken ?? null,
        ]
      );
      res.status(201).json(rows[0]);
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/dives/:dive_id/media",
  requireAuth,
  validate(listMediaForDiveSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const { dive_id } = (req as any).params;
      const { rows: d } = await query(
        'SELECT dive_id FROM "Dive" WHERE dive_id=$1 AND user_id=$2',
        [dive_id, uid]
      );
      if (!d) return res.status(404).json({ error: "Plongée introuvable" });
      const page = Number((req as any).query.page ?? 1),
        limit = Number((req as any).query.limit ?? 50),
        offset = (page - 1) * limit;
      const { rows } = await query(
        'SELECT * FROM "Media" WHERE dive_id=$1 ORDER BY uploaded_date DESC LIMIT $2 OFFSET $3',
        [dive_id, limit, offset]
      );
      res.json({ page, limit, data: rows });
    } catch (e) {
      next(e);
    }
  }
);

router.delete("/:media_id", requireAuth, async (req, res, next) => {
  try {
    const uid = (req as any).user.user_id;
    const media_id = Number(req.params.media_id);
    if (Number.isNaN(media_id)) {
      return res.status(400).json({ error: "Invalid media_id" });
    }
    const { rowCount } = await query(
      `DELETE FROM "Media" m USING "Dive" d WHERE m.media_id=$1 AND m.dive_id=d.dive_id AND d.user_id=$2`,
      [media_id, uid]
    );
    if (!rowCount) return res.status(404).json({ error: "Média introuvable" });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
