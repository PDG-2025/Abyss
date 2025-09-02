import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createGasSchema, gasIdSchema, listGasSchema } from "../schemas/gas";
import { query } from "../db/pool";

const router = Router();

router.post(
  "/",
  requireAuth,
  validate(createGasSchema),
  async (req, res, next) => {
    try {
      const g = (req as any).body;
      const { rows } = await query(
        'INSERT INTO "Gas"(name,oxygen,nitrogen,helium) VALUES ($1,$2,$3,$4) RETURNING *',
        [g.name, g.oxygen, g.nitrogen, g.helium]
      );
      res.status(201).json(rows);
    } catch (e: any) {
      if (e.code === "23505")
        return res.status(409).json({ error: "Nom de gaz déjà existant" });
      next(e);
    }
  }
);

router.get(
  "/",
  requireAuth,
  validate(listGasSchema),
  async (_req, res, next) => {
    try {
      const { rows } = await query('SELECT * FROM "Gas" ORDER BY name');
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/:id",
  requireAuth,
  validate(gasIdSchema),
  async (req, res, next) => {
    try {
      const { id } = (req as any).params;
      const { rows } = await query('SELECT * FROM "Gas" WHERE gas_id=$1', [id]);
      if (!rows) return res.status(404).json({ error: "Gaz introuvable" });
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  "/:id",
  requireAuth,
  validate(createGasSchema.merge(gasIdSchema)),
  async (req, res, next) => {
    try {
      const { id } = (req as any).params;
      const g = (req as any).body;
      const { rows } = await query(
        'UPDATE "Gas" SET name=$1, oxygen=$2, nitrogen=$3, helium=$4 WHERE gas_id=$5 RETURNING *',
        [g.name, g.oxygen, g.nitrogen, g.helium, id]
      );
      if (!rows) return res.status(404).json({ error: "Gaz introuvable" });
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  "/:id",
  requireAuth,
  validate(gasIdSchema),
  async (req, res, next) => {
    try {
      const { id } = (req as any).params;
      await query('UPDATE "Dive" SET gas_id=NULL WHERE gas_id=$1', [id]);
      const { rowCount } = await query('DELETE FROM "Gas" WHERE gas_id=$1', [
        id,
      ]);
      if (!rowCount) return res.status(404).json({ error: "Gaz introuvable" });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

export default router;
