import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

const r = Router();
r.use(authMiddleware);

r.get('/', async (req, res) => {
  const result = await db.execute({ sql: 'SELECT * FROM suppliers WHERE organization = ? ORDER BY created_at DESC', args: [req.user.organization] });
  res.json(result.rows);
});

r.post('/', async (req, res) => {
  const { name, contact, email, phone } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const id = randomUUID();
  await db.execute({
    sql: 'INSERT INTO suppliers (id, name, contact, email, phone, organization) VALUES (?,?,?,?,?,?)',
    args: [id, name, contact || '', email || '', phone || '', req.user.organization],
  });
  res.json({ id, ...req.body });
});

r.delete('/:id', async (req, res) => {
  await db.execute({ sql: 'DELETE FROM suppliers WHERE id=? AND organization=?', args: [req.params.id, req.user.organization] });
  res.json({ ok: true });
});

export default r;
