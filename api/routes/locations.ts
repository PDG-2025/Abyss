import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createLocationSchema,
  updateLocationSchema,
  locationIdSchema,
  listLocationsSchema,
} from "../schemas/locations";
import { query } from "../db/pool";

const router = Router();

router.post(
  "/",
  requireAuth,
  validate(createLocationSchema),
  async (req, res, next) => {
    try {
      const b = (req as any).body;
      const { rows } = await query(
        "INSERT INTO \"Location\"(name,latitude,longitude,water_type,certification_required) VALUES ($1,$2,$3,COALESCE($4,'unknown'),$5) RETURNING *",
        [
          b.name,
          b.latitude ?? null,
          b.longitude ?? null,
          b.water_type ?? null,
          b.certification_required ?? null,
        ]
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
  validate(listLocationsSchema),
  async (_req, res, next) => {
    try {
      const { rows } = await query('SELECT * FROM "Location" ORDER BY name');
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/:id",
  requireAuth,
  validate(locationIdSchema),
  async (req, res, next) => {
    try {
      const { id } = (req as any).params;
      const { rows } = await query(
        'SELECT * FROM "Location" WHERE location_id=$1',
        [id]
      );
      if (!rows) return res.status(404).json({ error: "Lieu introuvable" });
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  "/:id",
  requireAuth,
  validate(updateLocationSchema),
  async (req, res, next) => {
    try {
      const { id } = (req as any).params;
      const b = (req as any).body;
      const { rows } = await query(
        'UPDATE "Location" SET name=COALESCE($1,name), latitude=COALESCE($2,latitude), longitude=COALESCE($3,longitude), water_type=COALESCE($4,water_type), certification_required=COALESCE($5,certification_required) WHERE location_id=$6 RETURNING *',
        [
          b.name ?? null,
          b.latitude ?? null,
          b.longitude ?? null,
          b.water_type ?? null,
          b.certification_required ?? null,
          id,
        ]
      );
      if (!rows) return res.status(404).json({ error: "Lieu introuvable" });
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  "/:id",
  requireAuth,
  validate(locationIdSchema),
  async (req, res, next) => {
    try {
      const { id } = (req as any).params;
      await query('UPDATE "Dive" SET location_id=NULL WHERE location_id=$1', [
        id,
      ]);
      const { rowCount } = await query(
        'DELETE FROM "Location" WHERE location_id=$1',
        [id]
      );
      if (!rowCount) return res.status(404).json({ error: "Lieu introuvable" });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

export default router;
