import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const r = Router();
r.use(authMiddleware);

r.get('/', async (req, res) => {
  const result = await db.execute({
    sql: 'SELECT id, username, email, department, created_at FROM users WHERE organization = ? ORDER BY created_at DESC',
    args: [req.user.organization],
  });
  res.json(result.rows);
});

export default r;
