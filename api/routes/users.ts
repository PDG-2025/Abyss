import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateProfileSchema, listUserDivesSchema } from "../schemas/users";
import { query } from "../db/pool";

const router = Router();

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const uid = (req as any).user.user_id;
    const { rows } = await query(
      'SELECT user_id,name,email FROM "User" WHERE user_id=$1',
      [uid]
    );
    res.json(rows ?? null);
  } catch (e) {
    next(e);
  }
});

router.patch(
  "/me",
  requireAuth,
  validate(updateProfileSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const { name } = (req as any).body;
      const { rows } = await query(
        'UPDATE "User" SET name=COALESCE($1,name) WHERE user_id=$2 RETURNING user_id,name,email',
        [name ?? null, uid]
      );
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/me/dives",
  requireAuth,
  validate(listUserDivesSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const page = Number((req as any).query.page ?? 1);
      const limit = Number((req as any).query.limit ?? 50);
      const offset = (page - 1) * limit;
      const { rows } = await query(
        "SELECT * FROM vw_dive_summary WHERE user_id=$1 ORDER BY date DESC LIMIT $2 OFFSET $3",
        [uid, limit, offset]
      );
      res.json({ page, limit, data: rows });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
