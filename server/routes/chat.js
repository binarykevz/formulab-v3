import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { randomUUID } from 'crypto';

const r = Router();
r.use(authMiddleware);

r.get('/', async (req, res) => {
  const since = req.query.since || '1970-01-01';
  console.log(`[CHAT] List org=${req.user.organization} since=${since}`);
  const result = await db.execute({
    sql: 'SELECT * FROM messages WHERE organization = ? AND timestamp > ? ORDER BY timestamp ASC LIMIT 200',
    args: [req.user.organization, since],
  });
  res.json(result.rows);
});

r.post('/', async (req, res) => {
  try {
    const { text } = req.body;
    console.log(`[CHAT] ${req.user.username} (${req.user.department}): ${text?.substring(0, 80)}`);
    if (!text?.trim()) return res.status(400).json({ error: 'Empty message' });
    const id = randomUUID();
    await db.execute({
      sql: 'INSERT INTO messages (id, text, department, username, organization) VALUES (?,?,?,?,?)',
      args: [id, text.trim(), req.user.department, req.user.username, req.user.organization],
    });
    res.json({ id, text: text.trim(), department: req.user.department, username: req.user.username, timestamp: new Date().toISOString() });
  } catch (e) { console.error(`[CHAT] ERROR:`, e.message); res.status(500).json({ error: e.message }); }
});

export default r;
