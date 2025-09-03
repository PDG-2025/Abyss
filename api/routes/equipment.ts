import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { upsertEquipmentSchema } from "../schemas/equipment";
import { query } from "../db/pool";

const router = Router();

router.put(
  "/dives/:dive_id/equipment",
  requireAuth,
  validate(upsertEquipmentSchema),
  async (req, res, next) => {
    try {
      const uid = (req as any).user.user_id;
      const dive_id = Number(req.params.dive_id);
      if (Number.isNaN(dive_id)) {
        return res.status(400).json({ error: "Invalid dive_id" });
      }

      const b = (req as any).body;

      // Vérifier que la plongée appartient bien à l'utilisateur
      const { rows: diveRows } = await query(
        'SELECT dive_id FROM "Dive" WHERE dive_id=$1 AND user_id=$2',
        [dive_id, uid]
      );
      if (!diveRows || diveRows.length === 0) {
        return res.status(404).json({ error: "Plongée introuvable" });
      }

      // Vérifier si un équipement existe déjà pour cette plongée
      const { rows: existingRows } = await query(
        'SELECT equipment_id FROM "Equipment" WHERE dive_id=$1',
        [dive_id]
      );

      let result;
      if (existingRows.length > 0) {
        // UPDATE uniquement les champs fournis
        const setClauses: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if ('wetsuit_thickness' in b) {
          setClauses.push(`wetsuit_thickness = $${idx++}`);
          values.push(b.wetsuit_thickness);
        }
        if ('tank_size' in b) {
          setClauses.push(`tank_size = $${idx++}`);
          values.push(b.tank_size);
        }
        if ('tank_pressure_start' in b) {
          setClauses.push(`tank_pressure_start = $${idx++}`);
          values.push(b.tank_pressure_start);
        }
        if ('tank_pressure_end' in b) {
          setClauses.push(`tank_pressure_end = $${idx++}`);
          values.push(b.tank_pressure_end);
        }
        if ('weights_used' in b) {
          setClauses.push(`weights_used = $${idx++}`);
          values.push(b.weights_used);
        }

        if (setClauses.length === 0) {
          // Rien à mettre à jour
          const { rows } = await query(
            'SELECT * FROM "Equipment" WHERE dive_id=$1',
            [dive_id]
          );
          result = rows[0];
        } else {
          const sql = `UPDATE "Equipment"
                       SET ${setClauses.join(', ')}
                       WHERE dive_id = $${idx}
                       RETURNING *`;
          values.push(dive_id);
          const { rows } = await query(sql, values);
          result = rows[0];
        }
      } else {
        // INSERT complet si aucun équipement existant
        const { rows } = await query(
          `INSERT INTO "Equipment"
           (dive_id, wetsuit_thickness, tank_size, tank_pressure_start, tank_pressure_end, weights_used)
           VALUES ($1,$2,$3,$4,$5,$6)
           RETURNING *`,
          [
            dive_id,
            b.wetsuit_thickness ?? null,
            b.tank_size ?? null,
            b.tank_pressure_start ?? null,
            b.tank_pressure_end ?? null,
            b.weights_used ?? null,
          ]
        );
        result = rows[0];
      }

      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

router.get("/dives/:dive_id/equipment", requireAuth, async (req, res, next) => {
  try {
    const uid = (req as any).user.user_id;
    const { dive_id } = req.params;
    const { rows: d } = await query(
      'SELECT dive_id FROM "Dive" WHERE dive_id=$1 AND user_id=$2',
      [dive_id, uid]
    );
    if (!d || d.length === 0) return res.status(404).json({ error: "Plongée introuvable" });

    const { rows } = await query(
      'SELECT * FROM "Equipment" WHERE dive_id=$1',
      [dive_id]
    );
    res.json(rows[0] ?? null);
  } catch (e) {
    next(e);
  }
});

router.delete("/dives/:dive_id/equipment", requireAuth, async (req, res, next) => {
  try {
    const uid = (req as any).user.user_id;
    const dive_id = Number(req.params.dive_id);
    if (Number.isNaN(dive_id)) return res.status(400).json({ error: "Invalid dive_id" });

    const { rows: d } = await query(
      'SELECT dive_id FROM "Dive" WHERE dive_id=$1 AND user_id=$2',
      [dive_id, uid]
    );
    if (!d || d.length === 0) return res.status(404).json({ error: "Plongée introuvable" });

    await query('DELETE FROM "Equipment" WHERE dive_id=$1', [dive_id]);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
