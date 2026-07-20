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
    if (!username || !email || !password || !organization || !department)
      return res.status(400).json({ error: 'All fields required' });

    const existing = await db.execute({ sql: 'SELECT id FROM users WHERE email = ? OR username = ?', args: [email.toLowerCase(), username] });
    if (existing.rows.length) return res.status(409).json({ error: 'Email or username already exists' });

    const id = randomUUID();
    const hash = await bcrypt.hash(password, 10);
    await db.execute({
      sql: 'INSERT INTO users (id, username, email, password, organization, department) VALUES (?,?,?,?,?,?)',
      args: [id, username.trim(), email.toLowerCase().trim(), hash, organization.trim(), department],
    });

    sendTelegram(`<b>New Registration</b>\nUser: ${username}\nEmail: ${email}\nOrg: ${organization}\nDept: ${department}\nTime: ${new Date().toLocaleString()}`);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

r.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ error: 'Fields required' });

    const id = identifier.toLowerCase().trim();
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ? OR username = ?',
      args: [id, id],
    });
    if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    const { password: _, ...safe } = user;
    res.json({ ok: true, token, user: safe });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default r;
