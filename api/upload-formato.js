import { verifyBearerUser, serviceRestHeaders, getSupabaseEnv } from '../lib/server/verifyUser.js';
import { logger } from '../lib/server/logger.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { user, error: authErr, status: authStatus } = await verifyBearerUser(req);
  if (authErr || !user) {
    return res.status(authStatus || 401).json({ error: authErr || 'No autorizado' });
  }

  const { filename, content, tipo_reporte, es_ejemplo, compartido } = req.body;

  if (!filename || !content || !tipo_reporte) {
    return res.status(400).json({ error: 'Faltan datos: filename, content, tipo_reporte' });
  }

  const safeName = String(filename).split(/[/\\]/).pop().replace(/[^a-zA-Z0-9._\- ]/g, '_').substring(0, 255);
  if (!safeName) return res.status(400).json({ error: 'Nombre de archivo inválido' });

  const { url } = getSupabaseEnv();
  const headers = serviceRestHeaders();

  let institucionDelDocente = '';
  try {
    const profileRes = await fetch(
      `${url}/rest/v1/profiles?id=eq.${user.id}&select=institucion`,
      { headers },
    );
    const profileData = await profileRes.json();
    institucionDelDocente = profileData?.[0]?.institucion || '';
  } catch (error_) {
    logger.warn('upload-formato: no se pudo obtener institución', { err: error_.message });
  }

  try {
    const buffer = Buffer.from(content, 'base64');
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(413).json({ error: 'El archivo supera el tamaño máximo permitido (10 MB)' });
    }
    const fileExt = safeName.toLowerCase().split('.').pop();

    // Verificar magic bytes para evitar que archivos renombrados sean parseados
    // %PDF = 25 50 44 46  |  ZIP/XLSX = 50 4B 03 04
    const PDF_MAGIC  = Buffer.from([0x25, 0x50, 0x44, 0x46]);
    const XLSX_MAGIC = Buffer.from([0x50, 0x4B, 0x03, 0x04]);

    if (fileExt === 'pdf' && buffer.length >= 4 && !buffer.slice(0, 4).equals(PDF_MAGIC)) {
      return res.status(400).json({ error: 'El archivo no es un PDF válido' });
    }
    if ((fileExt === 'xlsx' || fileExt === 'xls') && buffer.length >= 4 && !buffer.slice(0, 4).equals(XLSX_MAGIC)) {
      return res.status(400).json({ error: 'El archivo no es un Excel válido' });
    }

    let textoExtraido = '';
    let numCampos = 0;

    if (fileExt === 'pdf') {
      try {
        const pdfParse = (await import('pdf-parse')).default;
        const data = await pdfParse(buffer);
        textoExtraido = data.text;
        const lineas = textoExtraido.split('\n').filter(l => l.trim());
        numCampos = lineas.filter(l => l.includes(':') || l.includes('____') || /\[\s*\]/.exec(l)).length;
      } catch (error_) {
        logger.error('upload-formato: error parsear PDF', { err: error_.message });
        return res.status(400).json({ error: 'Error al parsear PDF' });
      }
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      try {
        const XLSX = (await import('xlsx')).default;
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        textoExtraido = csv;
        const rows = csv.split('\n').filter(r => r.trim());
        numCampos = rows.reduce((acc, row) => acc + row.split(',').filter(c => c.trim()).length, 0);
      } catch (error_) {
        logger.error('upload-formato: error parsear Excel', { err: error_.message });
        return res.status(400).json({ error: 'Error al parsear Excel' });
      }
    } else {
      return res.status(400).json({ error: 'Formato no soportado. Use PDF o Excel (.xlsx, .xls)' });
    }

    if (!textoExtraido.trim()) {
      return res.status(400).json({ error: 'No se pudo extraer texto del archivo' });
    }

    const insertRes = await fetch(`${url}/rest/v1/formatos_institucionales`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({
        user_id: user.id,
        tipo_reporte,
        nombre_archivo: safeName,
        tipo_archivo: fileExt,
        contenido_extraido: textoExtraido,
        es_ejemplo: !!es_ejemplo,
        num_campos_detectados: numCampos,
        institucion: institucionDelDocente,
        compartido: !!compartido,
        activo: true,
      }),
    });

    const formato = await insertRes.json();
    logger.info('upload-formato: formato guardado', { userId: user.id, fileExt, numCampos });

    if (Array.isArray(formato) && formato[0]) {
      return res.status(201).json({
        success: true,
        formato: formato[0],
        preview: textoExtraido.substring(0, 500) + (textoExtraido.length > 500 ? '...' : ''),
      });
    }

    return res.status(400).json({ error: 'Error al guardar formato' });

  } catch (error_) {
    logger.error('upload-formato: error inesperado', { err: error_.message });
    return res.status(500).json({ error: 'Error del servidor' });
  }
}