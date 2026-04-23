// API para subir y parsear formatos institucionales (PDF/Excel)
// Librerías necesarias: pdf-parse, xlsx (agregar a package.json)

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_KEY;

  // Verify auth
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  let user;
  try {
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_KEY }
    });
    const userData = await userRes.json();
    if (!userData.id) return res.status(401).json({ error: 'Token inválido' });
    user = userData;
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  // Parse multipart form data (file upload)
  // For Vercel, we'll use base64 encoding from frontend
  const { filename, content, tipo_reporte, es_ejemplo } = req.body;

  if (!filename || !content || !tipo_reporte) {
    return res.status(400).json({ error: 'Faltan datos: filename, content, tipo_reporte' });
  }

  try {
    // Decode base64 file content
    const buffer = Buffer.from(content, 'base64');
    const fileExt = filename.toLowerCase().split('.').pop();
    
    let textoExtraido = '';
    let numCampos = 0;

    // Parse PDF
    if (fileExt === 'pdf') {
      try {
        const pdfParse = (await import('pdf-parse')).default;
        const data = await pdfParse(buffer);
        textoExtraido = data.text;
        
        // Detect field count (heuristic: lines with ":" or lines ending with "_____")
        const lineas = textoExtraido.split('\n').filter(l => l.trim());
        numCampos = lineas.filter(l => l.includes(':') || l.includes('____') || l.match(/\[\s*\]/)).length;
      } catch (e) {
        return res.status(400).json({ error: 'Error al parsear PDF', details: e.message });
      }
    }
    
    // Parse Excel
    else if (fileExt === 'xlsx' || fileExt === 'xls') {
      try {
        const XLSX = (await import('xlsx')).default;
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to text format (preserve structure)
        const csv = XLSX.utils.sheet_to_csv(sheet);
        textoExtraido = csv;
        
        // Count non-empty cells as potential fields
        const rows = csv.split('\n').filter(r => r.trim());
        numCampos = rows.reduce((acc, row) => acc + row.split(',').filter(c => c.trim()).length, 0);
      } catch (e) {
        return res.status(400).json({ error: 'Error al parsear Excel', details: e.message });
      }
    }
    
    else {
      return res.status(400).json({ error: 'Formato no soportado. Use PDF o Excel (.xlsx, .xls)' });
    }

    if (!textoExtraido.trim()) {
      return res.status(400).json({ error: 'No se pudo extraer texto del archivo' });
    }

    // Save to database
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/formatos_institucionales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: user.id,
        tipo_reporte,
        nombre_archivo: filename,
        tipo_archivo: fileExt,
        contenido_extraido: textoExtraido,
        es_ejemplo: !!es_ejemplo,
        num_campos_detectados: numCampos,
        activo: true
      })
    });

    const formato = await insertRes.json();
    
    if (Array.isArray(formato) && formato[0]) {
      return res.status(201).json({
        success: true,
        formato: formato[0],
        preview: textoExtraido.substring(0, 500) + (textoExtraido.length > 500 ? '...' : '')
      });
    }

    return res.status(400).json({ error: 'Error al guardar formato' });

  } catch (e) {
    return res.status(500).json({ error: 'Error del servidor', details: e.message });
  }
}