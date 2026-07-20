import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

import { initDB } from './db.js';
import { tgStatus } from './telegram.js';
import authRoutes from './routes/auth.js';
import materialRoutes from './routes/materials.js';
import formulationRoutes from './routes/formulations.js';
import supplierRoutes from './routes/suppliers.js';
import prRoutes from './routes/purchaserequests.js';
import chatRoutes from './routes/chat.js';
import teamRoutes from './routes/team.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── LOGGING MIDDLEWARE ───
app.use((req, res, next) => {
    const start = Date.now();
    const ts = () => `[${new Date().toLocaleTimeString()}]`;
    console.log(`${ts()} → ${req.method} ${req.url}`);

    const origEnd = res.end;
    res.end = function (...args) {
        const ms = Date.now() - start;
        const status = res.statusCode;
        const color = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : status >= 300 ? '\x1b[36m' : '\x1b[32m';
        const reset = '\x1b[0m';
        console.log(`${ts()} ← ${color}${status}${reset} ${req.method} ${req.url} ${color}(${ms}ms)${reset}`);
        origEnd.apply(this, args);
    };
    next();
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(join(__dirname, '..', 'public')));

// ─── API ROUTES ───
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/formulations', formulationRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-requests', prRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/team', teamRoutes);

// 404 catch
app.use('/api', (req, res) => {
    console.log(`[!] 404 API: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Endpoint not found' });
});

// SPA fallback
app.get('*', (_, res) => res.sendFile(join(__dirname, '..', 'public', 'index.html')));

await initDB();
app.listen(PORT, () => {
    console.log('┌───────────────────────────────────────────┐');
    console.log(`│  ERP Server running on port ${PORT}            │`);
    console.log(`│  http://localhost:${PORT}                    │`);
    console.log(`│  DB: ${process.env.TURSO_DB_URL?.substring(0, 30) || 'file:local.db'}   │`);
    console.log('└───────────────────────────────────────────┘');
});
