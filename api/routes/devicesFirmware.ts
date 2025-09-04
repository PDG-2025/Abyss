import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import pool from '../db/pool';
import {
  deviceFirmwareParamsSchema,
  deviceFirmwareBodySchema,
  type DeviceFirmwareParams,
  type DeviceFirmwareBody,
} from '../schemas/devicesFirmware';

const router = Router();

/**
 * PATCH /devices/:device_id/firmware
 * Body: { firmware_version }
 * Réponse: Device mis à jour
 */
router.patch(
  '/:device_id/firmware',
  requireAuth,
  validate({ params: deviceFirmwareParamsSchema, body: deviceFirmwareBodySchema }),
  async (req, res, next) => {
    const client = await pool.connect();
    try {
      const uid = (req as any).user.user_id as number;
      const { device_id } = req.params as unknown as DeviceFirmwareParams;
      const { firmware_version } = req.body as DeviceFirmwareBody;

      const { rows } = await client.query(
        'UPDATE "Device" SET firmware_version=$1 WHERE device_id=$2 AND user_id=$3 RETURNING *',
        [firmware_version, device_id, uid]
      );

      if (!rows) {
        return res.status(404).json({ error: 'Appareil introuvable' });
      }

      return res.json(rows);
    } catch (e) {
      next(e);
    } finally {
      client.release();
    }
  }
);

export default router;
