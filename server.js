import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { applySecurityHeaders } from './lib/server/securityHeaders.js';

import authHandler              from './api/auth.js';
import generateHandler          from './api/generate.mjs';
import cursosHandler            from './api/cursos.js';
import formatoHandler           from './api/upload-formato.js';
import formatosHandler          from './api/formatos.js';
import plantillasHandler        from './api/plantillas.js';
import reportesHandler          from './api/reportes.js';
import telemetryHandler         from './api/telemetry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

const jsonDefault = express.json({ limit: '2mb' });
const jsonLarge = express.json({ limit: '12mb' });

app.use((req, res, next) => {
  applySecurityHeaders(res);
  next();
});

app.use((req, res, next) => {
  if (req.path === '/api/upload-formato' && req.method === 'POST') {
    return jsonLarge(req, res, next);
  }
  return jsonDefault(req, res, next);
});

app.use(express.static(join(__dirname, 'public')));

app.all('/api/auth', (req, res) => authHandler(req, res));
app.all('/api/generate', (req, res) => generateHandler(req, res));
app.all('/api/cursos', (req, res) => cursosHandler(req, res));
app.all('/api/upload-formato', (req, res) => formatoHandler(req, res));
app.all('/api/formatos', (req, res) => formatosHandler(req, res));
app.all('/api/plantillas', (req, res) => plantillasHandler(req, res));
app.all('/api/reportes', (req, res) => reportesHandler(req, res));
app.all('/api/telemetry', (req, res) => telemetryHandler(req, res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API server → http://localhost:${PORT}`));
