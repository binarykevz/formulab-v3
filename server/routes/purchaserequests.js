import { Router } from 'express';
import db from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendTelegram } from '../telegram.js';

const r = Router();
r.use(authMiddleware);

const CAN_APPROVE = ['purchasing', 'management'];

r.get('/', async (req, res) => {
  console.log(`[PR] List user=${req.user.username} dept=${req.user.department} org=${req.user.organization}`);
  let result;
  if (CAN_APPROVE.includes(req.user.department)) {
    result = await db.execute({ sql: 'SELECT * FROM purchase_requests WHERE organization = ? ORDER BY id DESC', args: [req.user.organization] });
  } else {
    result = await db.execute({ sql: 'SELECT * FROM purchase_requests WHERE organization = ? AND requested_by = ? ORDER BY id DESC', args: [req.user.organization, req.user.username] });
  }
  console.log(`[PR] Found ${result.rows.length} PRs`);
  res.json(result.rows);
});

r.post('/', async (req, res) => {
  try {
    const { materialName, materialCode, quantity, unit, reason } = req.body;
    console.log(`[PR] Create: ${materialName} x${quantity} by ${req.user.username}`);
    if (!materialName || !quantity) return res.status(400).json({ error: 'Material name and quantity required' });

    const result = await db.execute({
      sql: `INSERT INTO purchase_requests (material_name, material_code, quantity, unit, reason, requested_by, requestor_dept, organization) VALUES (?,?,?,?,?,?,?,?)`,
      args: [materialName, materialCode || '', quantity, unit || 'kg', reason || '', req.user.username, req.user.department, req.user.organization],
    });
    const prId = result.lastInsertRowid;

    await db.execute({ sql: 'INSERT INTO pr_history (pr_id, status, changed_by) VALUES (?,?,?)', args: [prId, 'pending', req.user.username] });
    console.log(`[PR] Created: #${prId}`);
    await sendTelegram(`<b>New PR #${prId}</b>\nMaterial: ${materialName}\nQty: ${quantity} ${unit || 'kg'}\nBy: ${req.user.username} (${req.user.department})\nOrg: ${req.user.organization}`);
    res.json({ id: prId, status: 'pending' });
  } catch (e) { console.error(`[PR] Create ERROR:`, e.message); res.status(500).json({ error: e.message }); }
});

r.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['approved', 'rejected', 'arrival', 'received'];
    console.log(`[PR] Status: #${req.params.id} → ${status} by ${req.user.username}`);
    if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    if (!CAN_APPROVE.includes(req.user.department)) return res.status(403).json({ error: 'No permission' });

    await db.execute({ sql: 'UPDATE purchase_requests SET status=?, updated_at=datetime("now") WHERE id=? AND organization=?', args: [status, req.params.id, req.user.organization] });
    await db.execute({ sql: 'INSERT INTO pr_history (pr_id, status, changed_by) VALUES (?,?,?)', args: [req.params.id, status, req.user.username] });

    const pr = await db.execute({ sql: 'SELECT * FROM purchase_requests WHERE id=?', args: [req.params.id] });
    const name = pr.rows[0]?.material_name || '';
    console.log(`[PR] #${req.params.id} updated to ${status}`);
    await sendTelegram(`<b>PR #${req.params.id} → ${status.toUpperCase()}</b>\nMaterial: ${name}\nBy: ${req.user.username} (${req.user.department})`);
    res.json({ ok: true });
  } catch (e) { console.error(`[PR] Status ERROR:`, e.message); res.status(500).json({ error: e.message }); }
});

r.get('/:id/history', async (req, res) => {
  console.log(`[PR] History: #${req.params.id}`);
  const result = await db.execute({ sql: 'SELECT * FROM pr_history WHERE pr_id = ? ORDER BY changed_at ASC', args: [req.params.id] });
  res.json(result.rows);
});

export default r;
