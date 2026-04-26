import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import loginHandler           from './api/auth/login.js';
import signupHandler          from './api/auth/signup.js';
import recoverHandler         from './api/auth/recover.js';
import generateHandler        from './api/generate.mjs';
import cursosHandler          from './api/cursos.js';
import formatoHandler         from './api/upload-formato.js';
import formatosHandler        from './api/formatos.js';
import plantillasHandler      from './api/plantillas.js';
import reportesHandler        from './api/reportes.js';
import visitasHandler         from './api/visitas.js';
import reportesCopiadosHandler from './api/reportes-copiados.js';
import referralsHandler       from './api/referrals.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

const jsonDefault = express.json({ limit: '2mb' });
const jsonLarge = express.json({ limit: '12mb' });

app.use((req, res, next) => {
  if (req.path === '/api/upload-formato' && req.method === 'POST') {
    return jsonLarge(req, res, next);
  }
  return jsonDefault(req, res, next);
});

app.use(express.static(join(__dirname, 'public')));

app.all('/api/auth/login',          (req, res) => loginHandler(req, res));
app.all('/api/auth/signup',         (req, res) => signupHandler(req, res));
app.all('/api/auth/recover',        (req, res) => recoverHandler(req, res));
app.all('/api/generate',            (req, res) => generateHandler(req, res));
app.all('/api/cursos',              (req, res) => cursosHandler(req, res));
app.all('/api/upload-formato',      (req, res) => formatoHandler(req, res));
app.all('/api/formatos',            (req, res) => formatosHandler(req, res));
app.all('/api/plantillas',          (req, res) => plantillasHandler(req, res));
app.all('/api/reportes',            (req, res) => reportesHandler(req, res));
app.all('/api/visitas',             (req, res) => visitasHandler(req, res));
app.all('/api/reportes-copiados',   (req, res) => reportesCopiadosHandler(req, res));
app.all('/api/referrals',           (req, res) => referralsHandler(req, res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API server → http://localhost:${PORT}`));
