import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

const r = Router();
r.use(authMiddleware);

r.get('/', async (req, res) => {
  console.log(`[MAT] List org=${req.user.organization}`);
  const result = await db.execute({ sql: 'SELECT * FROM materials WHERE organization = ? ORDER BY created_at DESC', args: [req.user.organization] });
  console.log(`[MAT] Found ${result.rows.length} materials`);
  res.json(result.rows);
});

r.post('/', async (req, res) => {
  try {
    const { name, code, price, qtyBulk, amountPerSachet, supplier } = req.body;
    console.log(`[MAT] Create: ${name} (${code}) by ${req.user.username}`);
    if (!name || !code) return res.status(400).json({ error: 'Name and code required' });
    const id = randomUUID();
    await db.execute({
      sql: 'INSERT INTO materials (id, name, code, price, qty_bulk, amount_per_sachet, supplier, organization, created_by) VALUES (?,?,?,?,?,?,?,?,?)',
      args: [id, name, code, price || 0, qtyBulk || 0, amountPerSachet || 0, supplier || '', req.user.organization, req.user.username],
    });
    console.log(`[MAT] Created: ${id}`);
    res.json({ id, ...req.body });
  } catch (e) { console.error(`[MAT] Create ERROR:`, e.message); res.status(500).json({ error: e.message }); }
});

r.put('/:id', async (req, res) => {
  try {
    const { name, code, price, qtyBulk, amountPerSachet, supplier } = req.body;
    console.log(`[MAT] Update: ${req.params.id}`);
    await db.execute({
      sql: 'UPDATE materials SET name=?, code=?, price=?, qty_bulk=?, amount_per_sachet=?, supplier=? WHERE id=? AND organization=?',
      args: [name, code, price || 0, qtyBulk || 0, amountPerSachet || 0, supplier || '', req.params.id, req.user.organization],
    });
    console.log(`[MAT] Updated: ${req.params.id}`);
    res.json({ ok: true });
  } catch (e) { console.error(`[MAT] Update ERROR:`, e.message); res.status(500).json({ error: e.message }); }
});

r.delete('/:id', async (req, res) => {
  console.log(`[MAT] Delete: ${req.params.id}`);
  await db.execute({ sql: 'DELETE FROM materials WHERE id=? AND organization=?', args: [req.params.id, req.user.organization] });
  console.log(`[MAT] Deleted: ${req.params.id}`);
  res.json({ ok: true });
});

export default r;
