import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization;
  if (!hdr?.startsWith("Bearer "))
    return res.status(401).json({ error: "Unauthorized" });
  const token = hdr.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
      user_id: number;
    };
    (req as any).user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
