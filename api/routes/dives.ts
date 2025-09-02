import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  listDivesSchema,
  createDiveSchema,
  updateDiveSchema,
  diveIdSchema,
} from "../schemas/dives";
import { query } from "../db/pool";

const router = Router();

router.get(
  "/",
  requireAuth,
  validate(listDivesSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const q = (req as any).query;
      const page = Number(q.page ?? 1),
        limit = Number(q.limit ?? 50),
        offset = (page - 1) * limit;
      const filters: string[] = ["user_id=$1"];
      const params: any[] = [uid];
      if (q.from) {
        params.push(q.from);
        filters.push(`date >= $${params.length}`);
      }
      if (q.to) {
        params.push(q.to);
        filters.push(`date <= $${params.length}`);
      }
      if (q.device_id) {
        params.push(q.device_id);
        filters.push(`device_id = $${params.length}`);
      }
      if (q.location_id) {
        params.push(q.location_id);
        filters.push(`location_id = $${params.length}`);
      }
      if (q.gas_id) {
        params.push(q.gas_id);
        filters.push(`gas_id = $${params.length}`);
      }
      params.push(limit, offset);
      const sql = `SELECT * FROM vw_dive_summary WHERE ${filters.join(
        " AND "
      )} ORDER BY date DESC LIMIT $${params.length - 1} OFFSET $${
        params.length
      }`;
      const { rows } = await query(sql, params);
      res.json({ page, limit, data: rows });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/",
  requireAuth,
  validate(createDiveSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const b = (req as any).body;
      const { rows } = await query(
        `INSERT INTO "Dive"(user_id,device_id,location_id,gas_id,buddy_name,dive_purpose,entry_type,certification_level,visibility_underwater,notes,date,duration,depth_max,average_depth,ndl_limit)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
        [
          uid,
          b.device_id ?? null,
          b.location_id ?? null,
          b.gas_id ?? null,
          b.buddy_name ?? null,
          b.dive_purpose ?? null,
          b.entry_type ?? null,
          b.certification_level ?? null,
          b.visibility_underwater ?? null,
          b.notes ?? null,
          b.date,
          b.duration,
          b.depth_max,
          b.average_depth,
          b.ndl_limit ?? null,
        ]
      );
      res.status(201).json(rows[0]);
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/:id",
  requireAuth,
  validate(diveIdSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: "Invalid dive_id" });
      }
      const { rows } = await query(
        'SELECT * FROM "Dive" WHERE dive_id=$1 AND user_id=$2',
        [id, uid]
      );
      if (rows.length === 0) return res.status(404).json({ error: 'Dive not found' });

    res.json(rows[0]);
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  "/:id",
  requireAuth,
  validate(updateDiveSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: "Invalid device_id" });
      }
      const b = (req as any).body;
      const { rows } = await query(
        `UPDATE "Dive" SET
        device_id = COALESCE($1,device_id),
        location_id = COALESCE($2,location_id),
        gas_id = COALESCE($3,gas_id),
        buddy_name = COALESCE($4,buddy_name),
        dive_purpose = COALESCE($5,dive_purpose),
        entry_type = COALESCE($6,entry_type),
        certification_level = COALESCE($7,certification_level),
        visibility_underwater = COALESCE($8,visibility_underwater),
        notes = COALESCE($9,notes),
        date = COALESCE($10,date),
        duration = COALESCE($11,duration),
        depth_max = COALESCE($12,depth_max),
        average_depth = COALESCE($13,average_depth),
        ndl_limit = COALESCE($14,ndl_limit)
       WHERE dive_id=$15 AND user_id=$16 RETURNING *`,
        [
          b.device_id ?? null,
          b.location_id ?? null,
          b.gas_id ?? null,
          b.buddy_name ?? null,
          b.dive_purpose ?? null,
          b.entry_type ?? null,
          b.certification_level ?? null,
          b.visibility_underwater ?? null,
          b.notes ?? null,
          b.date ?? null,
          b.duration ?? null,
          b.depth_max ?? null,
          b.average_depth ?? null,
          b.ndl_limit ?? null,
          id,
          uid,
        ]
      );
      if (!rows) return res.status(404).json({ error: "Plongée introuvable" });
      res.json(rows[0]);
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  "/:id",
  requireAuth,
  validate(diveIdSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const id = Number(req.params.id);
      console.log(id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: "Invalid dive_id" });
      }
      const { rowCount } = await query(
        'DELETE FROM "Dive" WHERE dive_id=$1 AND user_id=$2',
        [id, uid]
      );
         if (rowCount === 0) return res.status(404).json({ error: 'Dive not found' });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

export default router;
