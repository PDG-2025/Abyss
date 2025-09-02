import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { latestFirmwareQuerySchema, type LatestFirmwareQuery } from '../schemas/firmware';
// import pool from '../db/pool'; // si vous lisez en DB

const router = Router();

/**
 * GET /firmware/latest?model=Abyss-One
 * Réponse: { model, version, url, checksum, size, mandatory, release_notes }
 */
router.get(
  '/latest',
  requireAuth,
  validate({ query: latestFirmwareQuerySchema }),
  async (req, res, next) => {
    try {
      const { model } = req.query as LatestFirmwareQuery;

      // TODO: remplacer par lecture DB si table "Firmware" (ORDER BY semver DESC LIMIT 1)
      // const { rows } = await pool.query(`SELECT ... FROM "Firmware" WHERE model=$1 ORDER BY semver DESC LIMIT 1`, [model]);

      const latest = {
        model,
        version: '1.2.3',
        url: `https://cdn.example.com/firmware/${encodeURIComponent(model.toLowerCase())}-1.2.3.bin`,//TODO a definir le chemin d'acces du patch
        checksum: 'sha256-BASE64-HERE',
        size: 1234567,
        mandatory: false,
        release_notes: 'Corrections BLE et stabilité améliorée.',
      };

      return res.json(latest);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
