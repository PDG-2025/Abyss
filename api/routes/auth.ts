import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "../db/pool";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema } from "../schemas/auth";

const router = Router();

router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password } = (req as any).body;
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await query(
      'INSERT INTO "User"(name,email,password_hash) VALUES ($1,$2,$3) RETURNING user_id,name,email',
      [name, email.toLowerCase(), hash]
    );
    const token = jwt.sign(
  { user_id: rows[0].user_id },
  process.env.JWT_SECRET as string,
  { expiresIn: "7d" }
);
res.status(201).json({ user: rows[0], token });

  } catch (e: any) {
    if (e.code === "23505")
      return res.status(409).json({ error: "Email déjà utilisé" });
    next(e);
  }
});

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = (req as any).body;
    const { rows } = await query(
      'SELECT user_id,name,email,password_hash FROM "User" WHERE email=$1',
      [email.toLowerCase()]
    );
    if (!rows.length)
      return res.status(401).json({ error: "Identifiants invalides" });

    const ok = await bcrypt.compare(password, rows[0].password_hash);
    const token = jwt.sign(
      { user_id: rows[0].user_id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );
    delete rows[0].password_hash;
    res.json({ user: rows[0], token });
  } catch (e) {
    next(e);
  }
});

export default router;
