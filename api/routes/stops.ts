import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { query } from "../db/pool";

const router = Router();

// Remplacer la liste de paliers pour la plongée
router.post("/dives/:dive_id/stops", requireAuth, async (req, res, next) => {
  const pool = require("../db/pool").pool;
  const client = await pool.connect();

  try {
    if (!client) throw new Error("DB");
    const uid = (req as any).user.user_id;
    const { dive_id } = req.params;
    const items = req.body as any[];
    const { rows: d } = await client.query(
      'SELECT dive_id FROM "Dive" WHERE dive_id=$1 AND user_id=$2',
      [dive_id, uid]
    );
    if (!d) return res.status(404).json({ error: "Plongée introuvable" });
    await client.query("BEGIN");
    await client.query('DELETE FROM "DecompressionStop" WHERE dive_id=$1', [
      dive_id,
    ]);
    if (Array.isArray(items) && items.length) {
      const values: string[] = [];
      const params: any[] = [];
      items.forEach((s, i) => {
        const base = i * 3;
        values.push(`($${base + 1},$${base + 2},$${base + 3})`);
        params.push(dive_id, s.depth, s.duration);
      });
      await client.query(
        `INSERT INTO "DecompressionStop"(dive_id,depth,duration) VALUES ${values.join(
          ","
        )}`,
        params
      );
    }
    await client.query("COMMIT");
    res.status(201).json({ count: Array.isArray(items) ? items.length : 0 });
  } catch (e) {
    if (client) await client.query("ROLLBACK");
    next(e);
  } finally {
    if (client) (client as any).release();
  }
});

router.get("/dives/:dive_id/stops", requireAuth, async (req, res, next) => {
  try {
    const uid = (req as any).user.user_id;
    const { dive_id } = req.params;
    const { rows: d } = await query(
      'SELECT dive_id FROM "Dive" WHERE dive_id=$1 AND user_id=$2',
      [dive_id, uid]
    );
    if (!d) return res.status(404).json({ error: "Plongée introuvable" });
    const { rows } = await query(
      'SELECT * FROM "DecompressionStop" WHERE dive_id=$1 ORDER BY depth DESC',
      [dive_id]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.delete("/dives/:dive_id/stops", requireAuth, async (req, res, next) => {
  try {
    const uid = (req as any).user.user_id;
    const { dive_id } = req.params;
    const { rows: d } = await query(
      'SELECT dive_id FROM "Dive" WHERE dive_id=$1 AND user_id=$2',
      [dive_id, uid]
    );
    if (!d) return res.status(404).json({ error: "Plongée introuvable" });
    await query('DELETE FROM "DecompressionStop" WHERE dive_id=$1', [dive_id]);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
