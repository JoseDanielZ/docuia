export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password, name, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña son obligatorios' });

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_KEY;

  try {
    // 1. Create user in Supabase Auth
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
      body: JSON.stringify({ email, password, data: { name, role } }),
    });
    const authData = await authRes.json();

    if (authData.error) return res.status(400).json({ error: authData.error.message || authData.msg });

    // 2. Save profile to profiles table
    if (authData.user) {
      await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          id: authData.user.id,
          email,
          name: name || '',
          role: role || 'Docente',
          institucion: req.body.institucion || '',
          cargo: req.body.cargo || role || 'Docente',
        }),
      });
    }

    return res.status(200).json({
      success: true,
      user: authData.user,
      session: authData.session,
    });
  } catch (e) {
    return res.status(500).json({ error: 'Error del servidor', details: e.message });
  }
}
