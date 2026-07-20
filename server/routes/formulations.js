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
  console.log(`[FORM] List org=${req.user.organization}`);
  const result = await db.execute({ sql: 'SELECT * FROM formulations WHERE organization = ? ORDER BY created_at DESC', args: [req.user.organization] });
  console.log(`[FORM] Found ${result.rows.length} formulations`);
  res.json(result.rows);
});

r.post('/', async (req, res) => {
  try {
    const { name, code, price, qtyBulk, amountPerSachet, supplier } = req.body;
    console.log(`[FORM] Create: ${name} (${code}) by ${req.user.username}`);
    if (!name || !code) return res.status(400).json({ error: 'Name and code required' });
    const id = randomUUID();
    await db.execute({
      sql: 'INSERT INTO formulations (id, name, code, price, qty_bulk, amount_per_sachet, supplier, organization, created_by) VALUES (?,?,?,?,?,?,?,?,?)',
      args: [id, name, code, price || 0, qtyBulk || 0, amountPerSachet || 0, supplier || '', req.user.organization, req.user.username],
    });
    console.log(`[FORM] Created: ${id}`);
    res.json({ id, ...req.body });
  } catch (e) { console.error(`[FORM] Create ERROR:`, e.message); res.status(500).json({ error: e.message }); }
});

r.delete('/:id', async (req, res) => {
  console.log(`[FORM] Delete: ${req.params.id}`);
  await db.execute({ sql: 'DELETE FROM formulations WHERE id=? AND organization=?', args: [req.params.id, req.user.organization] });
  console.log(`[FORM] Deleted: ${req.params.id}`);
  res.json({ ok: true });
});

// PDF upload and forward to Telegram
r.post('/pdf', upload.single('document'), async (req, res) => {
  try {
    console.log(`[FORM] PDF upload received`);
    if (!req.file) { console.log(`[FORM] PDF FAIL: no file`); return res.status(400).json({ error: 'No file' }); }
    console.log(`[FORM] PDF file: ${req.file.originalname} (${req.file.size} bytes)`);
    const caption = req.body.caption || 'Formulation Report';
    const result = await sendTelegramDocument(req.file.buffer, req.file.originalname, caption);
    console.log(`[FORM] PDF forwarded to Telegram: ${result?.ok ? 'SUCCESS' : 'FAILED/SKIPPED'}`);
    res.json({ ok: true, telegram: result?.ok || false });
  } catch (e) {
    console.error(`[FORM] PDF ERROR:`, e.message);
    res.status(500).json({ error: e.message });
  }
});

export default r;
