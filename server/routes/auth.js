import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { signToken } from '../middleware/auth.js';
import { sendTelegram } from '../telegram.js';
import { randomUUID } from 'crypto';

const r = Router();

r.post('/register', async (req, res) => {
  try {
    const { username, email, password, organization, department } = req.body;
    console.log(`[AUTH] Register: ${username} / ${email} / ${organization} / ${department}`);
    if (!username || !email || !password || !organization || !department)
      return res.status(400).json({ error: 'All fields required' });

    const existing = await db.execute({ sql: 'SELECT id FROM users WHERE email = ? OR username = ?', args: [email.toLowerCase(), username] });
    if (existing.rows.length) { console.log(`[AUTH] Register FAIL: duplicate`); return res.status(409).json({ error: 'Email or username already exists' }); }

    const id = randomUUID();
    const hash = await bcrypt.hash(password, 10);
    await db.execute({
      sql: 'INSERT INTO users (id, username, email, password, organization, department) VALUES (?,?,?,?,?,?)',
      args: [id, username.trim(), email.toLowerCase().trim(), hash, organization.trim(), department],
    });
    console.log(`[AUTH] Register OK: ${username} (${id})`);
    await sendTelegram(`<b>New Registration</b>\nUser: ${username}\nEmail: ${email}\nOrg: ${organization}\nDept: ${department}\nTime: ${new Date().toLocaleString()}`);
    res.json({ ok: true });
  } catch (e) {
    console.error(`[AUTH] Register ERROR:`, e.message);
    res.status(500).json({ error: e.message });
  }
});

r.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    console.log(`[AUTH] Login: ${identifier}`);
    if (!identifier || !password) return res.status(400).json({ error: 'Fields required' });

    const id = identifier.toLowerCase().trim();
    const result = await db.execute({ sql: 'SELECT * FROM users WHERE email = ? OR username = ?', args: [id, id] });
    if (!result.rows.length) { console.log(`[AUTH] Login FAIL: user not found`); return res.status(401).json({ error: 'Invalid credentials' }); }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) { console.log(`[AUTH] Login FAIL: wrong password`); return res.status(401).json({ error: 'Invalid credentials' }); }

    const token = signToken(user);
    const { password: _, ...safe } = user;
    console.log(`[AUTH] Login OK: ${user.username} (${user.department}, ${user.organization})`);
    res.json({ ok: true, token, user: safe });
  } catch (e) {
    console.error(`[AUTH] Login ERROR:`, e.message);
    res.status(500).json({ error: e.message });
  }
});

export default r;
