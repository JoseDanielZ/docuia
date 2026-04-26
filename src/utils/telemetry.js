/** Telemetría vía API del servidor (sin clave Supabase en el cliente). */

export async function recordVisita(referrer) {
  try {
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'visita',
        referrer: typeof referrer === 'string' ? referrer : 'directo',
      }),
    });
  } catch {
    /* silencioso */
  }
}
