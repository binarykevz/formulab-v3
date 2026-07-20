import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

import { initDB } from './db.js';
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

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '..', 'public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/formulations', formulationRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-requests', prRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/team', teamRoutes);

// SPA fallback
app.get('*', (_, res) => res.sendFile(join(__dirname, '..', 'public', 'index.html')));

await initDB();
app.listen(PORT, () => console.log(`[ERP] Server running on http://localhost:${PORT}`));
