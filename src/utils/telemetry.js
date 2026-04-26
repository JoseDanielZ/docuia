/** Telemetría vía API del servidor (sin clave Supabase en el cliente). */

export async function recordVisita(referrer) {
  try {
    await fetch('/api/visitas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referrer: typeof referrer === 'string' ? referrer : 'directo',
      }),
    });
  } catch {
    /* silencioso */
  }
}
