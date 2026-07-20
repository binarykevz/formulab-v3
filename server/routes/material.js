import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

const r = Router();
r.use(authMiddleware);

r.get('/', async (req, res) => {
  const result = await db.execute({ sql: 'SELECT * FROM materials WHERE organization = ? ORDER BY created_at DESC', args: [req.user.organization] });
  res.json(result.rows);
});

r.post('/', async (req, res) => {
  const { name, code, price, qtyBulk, amountPerSachet, supplier } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Name and code required' });
  const id = randomUUID();
  await db.execute({
    sql: 'INSERT INTO materials (id, name, code, price, qty_bulk, amount_per_sachet, supplier, organization, created_by) VALUES (?,?,?,?,?,?,?,?,?)',
    args: [id, name, code, price || 0, qtyBulk || 0, amountPerSachet || 0, supplier || '', req.user.organization, req.user.username],
  });
  res.json({ id, ...req.body });
});

r.put('/:id', async (req, res) => {
  const { name, code, price, qtyBulk, amountPerSachet, supplier } = req.body;
  await db.execute({
    sql: 'UPDATE materials SET name=?, code=?, price=?, qty_bulk=?, amount_per_sachet=?, supplier=? WHERE id=? AND organization=?',
    args: [name, code, price || 0, qtyBulk || 0, amountPerSachet || 0, supplier || '', req.params.id, req.user.organization],
  });
  res.json({ ok: true });
});

r.delete('/:id', async (req, res) => {
  await db.execute({ sql: 'DELETE FROM materials WHERE id=? AND organization=?', args: [req.params.id, req.user.organization] });
  res.json({ ok: true });
});

export default r;
