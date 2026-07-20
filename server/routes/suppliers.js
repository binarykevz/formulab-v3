import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

const r = Router();
r.use(authMiddleware);

r.get('/', async (req, res) => {
  console.log(`[SUP] List org=${req.user.organization}`);
  const result = await db.execute({ sql: 'SELECT * FROM suppliers WHERE organization = ? ORDER BY created_at DESC', args: [req.user.organization] });
  console.log(`[SUP] Found ${result.rows.length} suppliers`);
  res.json(result.rows);
});

r.post('/', async (req, res) => {
  try {
    const { name, contact, email, phone } = req.body;
    console.log(`[SUP] Create: ${name} by ${req.user.username}`);
    if (!name) return res.status(400).json({ error: 'Name required' });
    const id = randomUUID();
    await db.execute({
      sql: 'INSERT INTO suppliers (id, name, contact, email, phone, organization) VALUES (?,?,?,?,?,?)',
      args: [id, name, contact || '', email || '', phone || '', req.user.organization],
    });
    console.log(`[SUP] Created: ${id}`);
    res.json({ id, ...req.body });
  } catch (e) { console.error(`[SUP] Create ERROR:`, e.message); res.status(500).json({ error: e.message }); }
});

r.delete('/:id', async (req, res) => {
  console.log(`[SUP] Delete: ${req.params.id}`);
  await db.execute({ sql: 'DELETE FROM suppliers WHERE id=? AND organization=?', args: [req.params.id, req.user.organization] });
  console.log(`[SUP] Deleted: ${req.params.id}`);
  res.json({ ok: true });
});

export default r;

