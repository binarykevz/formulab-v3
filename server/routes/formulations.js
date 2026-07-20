import { Router } from 'express';
import multer from 'multer';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendTelegramDocument, sendTelegram } from '../telegram.js';
import { randomUUID } from 'crypto';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const r = Router();
r.use(authMiddleware);


r.get('/', async (req, res) => {
  const result = await db.execute({ sql: 'SELECT * FROM formulations WHERE organization = ? ORDER BY created_at DESC', args: [req.user.organization] });
  res.json(result.rows);
});

r.post('/', async (req, res) => {
  const { name, code, price, qtyBulk, amountPerSachet, supplier } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Name and code required' });
  const id = randomUUID();
  await db.execute({
    sql: 'INSERT INTO formulations (id, name, code, price, qty_bulk, amount_per_sachet, supplier, organization, created_by) VALUES (?,?,?,?,?,?,?,?,?)',
    args: [id, name, code, price || 0, qtyBulk || 0, amountPerSachet || 0, supplier || '', req.user.organization, req.user.username],
  });
  res.json({ id, ...req.body });
});

r.delete('/:id', async (req, res) => {
  await db.execute({ sql: 'DELETE FROM formulations WHERE id=? AND organization=?', args: [req.params.id, req.user.organization] });
  res.json({ ok: true });
});

// PDF upload and forward to Telegram
r.post('/pdf', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const caption = req.body.caption || 'Formulation Report';
    await sendTelegramDocument(req.file.buffer, req.file.originalname, caption);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default r;
