/**
 * Rate limiting en memoria (mejor que nada en serverless; por instancia).
 * Para producción a escala, usar Redis / Upstash / Vercel KV.
 */

const buckets = new Map();

export function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.trim()) {
    return fwd.split(',')[0].trim().slice(0, 64);
  }
  const ra = req.socket?.remoteAddress;
  return typeof ra === 'string' ? ra.slice(0, 64) : 'unknown';
}

/**
 * @param {string} bucketId - identificador único (ej. IP o userId)
 * @param {number} max - máximo de hits en la ventana
 * @param {number} windowMs - duración de la ventana en ms
 * @returns {boolean} true si está permitido
 */
export function allowRateLimit(bucketId, max, windowMs) {
  const now = Date.now();
  let b = buckets.get(bucketId);
  if (!b || now - b.start >= windowMs) {
    b = { start: now, count: 0 };
    buckets.set(bucketId, b);
  }
  b.count += 1;
  if (b.count > max) return false;
  return true;
}
