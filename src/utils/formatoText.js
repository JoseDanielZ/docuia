// ═══════════════════════════════════════════════════════════════════════════════
// DocuIA — Helpers para manipular el texto extraído de los formatos (PDF/Excel)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Limpia el texto extraído del PDF/Excel para reducir ruido antes de enviarlo
 * al modelo:
 *   - Colapsa saltos de línea repetidos (3+ → 2)
 *   - Quita espacios al final de cada línea
 *   - Quita líneas que solo contienen un número (números de página)
 *   - Quita líneas con solo guiones, puntos o caracteres decorativos
 *   - Colapsa espacios múltiples a uno solo
 *   - Recorta espacios al inicio/fin
 */
export function cleanFormatoText(raw) {
  if (!raw || typeof raw !== "string") return "";

  let text = raw.replace(/\r\n?/g, "\n");

  text = text
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, "").replace(/[ \t]{2,}/g, " "))
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true; // mantenemos vacías para luego colapsar
      if (/^\d{1,3}$/.test(trimmed)) return false; // número de página
      if (/^[\-_=.·•\s]{3,}$/.test(trimmed)) return false; // separadores decorativos
      return true;
    })
    .join("\n");

  text = text.replace(/\n{3,}/g, "\n\n");
  return text.trim();
}

/**
 * Devuelve las primeras N líneas (o N caracteres) del texto, útil para previews
 * de UI. Recorta a un tope de caracteres si es muy largo.
 */
export function getFormatoPreview(raw, { maxChars = 600, maxLines = 18 } = {}) {
  const cleaned = cleanFormatoText(raw);
  if (!cleaned) return "";
  const lines = cleaned.split("\n").slice(0, maxLines).join("\n");
  if (lines.length <= maxChars) return lines;
  return lines.slice(0, maxChars).trimEnd() + "…";
}

/**
 * Recorta de forma inteligente el contenido para enviarlo al LLM.
 * Si supera el límite, prioriza el inicio (estructura típica del formato:
 * encabezado + secciones) y agrega una marca al final.
 */
export function truncateForLLM(raw, maxChars = 12000) {
  const cleaned = cleanFormatoText(raw);
  if (cleaned.length <= maxChars) return cleaned;
  return (
    cleaned.slice(0, maxChars) +
    `\n\n[...formato truncado, se enviaron ${maxChars} de ${cleaned.length} caracteres...]`
  );
}
