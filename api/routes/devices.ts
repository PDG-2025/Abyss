import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createDeviceSchema,
  updateDeviceSchema,
  deviceIdSchema,
  listDeviceDivesSchema,
  createBatteryStatusSchema,
} from "../schemas/devices";
import { query } from "../db/pool";

const router = Router();

router.post(
  "/",
  requireAuth,
  validate(createDeviceSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const b = (req as any).body;
      const { rows } = await query(
        'INSERT INTO "Device"(user_id,serial_number,model,firmware_version) VALUES ($1,$2,$3,$4) RETURNING *',
        [uid, b.serial_number, b.model, b.firmware_version]
      );
      res.status(201).json(rows[0]);
    } catch (e: any) {
      if (e.code === "23505")
        return res
          .status(409)
          .json({ error: "Serial déjà utilisé pour cet utilisateur" });
      next(e);
    }
  }
);

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const uid = (req as any).user.user_id;
    const { rows } = await query(
      'SELECT * FROM "Device" WHERE user_id=$1 ORDER BY device_id',
      [uid]
    );
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.get(
  "/:device_id",
  requireAuth,
  validate(deviceIdSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const { device_id } = (req as any).params;
      const { rows } = await query(
        'SELECT * FROM "Device" WHERE device_id=$1 AND user_id=$2',
        [device_id, uid]
      );
      if (rows.length === 0) return res.status(404).json({ error: "Appareil introuvable" });

      res.json(rows[0]);
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  "/:device_id",
  requireAuth,
  validate(updateDeviceSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const { device_id } = (req as any).params;
      const b = (req as any).body;
      const { rows } = await query(
        'UPDATE "Device" SET model=COALESCE($1,model), firmware_version=COALESCE($2,firmware_version) WHERE device_id=$3 AND user_id=$4 RETURNING *',
        [b.model ?? null, b.firmware_version ?? null, device_id, uid]
      );
      if (rows.length === 0) return res.status(404).json({ error: "Appareil introuvable" });

      res.json(rows[0]);
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  "/:device_id",
  requireAuth,
  validate(deviceIdSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const { device_id } = (req as any).params;
      const { rowCount } = await query(
        'DELETE FROM "Device" WHERE device_id=$1 AND user_id=$2',
        [device_id, uid]
      );
      if (!rowCount)
        return res.status(404).json({ error: "Appareil introuvable" });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/:device_id/battery",
  requireAuth,
  validate(createBatteryStatusSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
     const deviceId = Number(req.params.device_id);
    if (Number.isNaN(deviceId)) {
      return res.status(400).json({ error: "Invalid device_id" });
    }

      const b = (req as any).body;
      const { rows: dev } = await query(
        'SELECT device_id FROM "Device" WHERE device_id=$1 AND user_id=$2',
        [deviceId, uid]
      );
      if (dev.length === 0) return res.status(404).json({ error: "Appareil introuvable" });
      const { rows } = await query(
        'INSERT INTO "BatteryStatus"(device_id,percentage,status_date) VALUES ($1,$2,COALESCE($3,NOW())) RETURNING *',
        [deviceId, b.percentage, b.status_date ?? null]
      );
      res.status(201).json(rows);
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/:device_id/battery",
  requireAuth,
  validate(deviceIdSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const { device_id } = (req as any).params;
      const { rows: dev } = await query(
        'SELECT device_id FROM "Device" WHERE device_id=$1 AND user_id=$2',
        [device_id, uid]
      );
      if (!dev) return res.status(404).json({ error: "Appareil introuvable" });
      const { rows } = await query(
        'SELECT * FROM "BatteryStatus" WHERE device_id=$1 ORDER BY status_date DESC LIMIT 200',
        [device_id]
      );
      res.json(rows);
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  "/:device_id/dives",
  requireAuth,
  validate(listDeviceDivesSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const { device_id } = (req as any).params;
      const page = Number((req as any).query.page ?? 1);
      const limit = Number((req as any).query.limit ?? 50);
      const offset = (page - 1) * limit;
      const { rows: dev } = await query(
        'SELECT device_id FROM "Device" WHERE device_id=$1 AND user_id=$2',
        [device_id, uid]
      );
      if (!dev) return res.status(404).json({ error: "Appareil introuvable" });
      const { rows } = await query(
        'SELECT * FROM "Dive" WHERE device_id=$1 ORDER BY date DESC LIMIT $2 OFFSET $3',
        [device_id, limit, offset]
      );
      res.json({ page, limit, data: rows });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
