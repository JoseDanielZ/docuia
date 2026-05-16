/**
 * Structured JSON logger for serverless functions.
 * Outputs JSON so Vercel logs (and any log aggregator) can parse and filter entries.
 */

function write(level, msg, meta = {}) {
  const entry = JSON.stringify({
    ts:  new Date().toISOString(),
    level,
    msg,
    ...meta,
  });
  if (level === "error" || level === "warn") {
    console.error(entry);
  } else {
    console.log(entry);
  }
}

export const logger = {
  info:  (msg, meta) => write("info",  msg, meta),
  warn:  (msg, meta) => write("warn",  msg, meta),
  error: (msg, meta) => write("error", msg, meta),
};
