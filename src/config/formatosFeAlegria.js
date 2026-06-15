/** Re-export compat + paths preview/template */
export {
  FE_ALEGRIA_TYPES as FE_ALEGRIA_TYPE_IDS,
  isFeAlegriaType,
  FORMATOS_FE_ALEGRIA,
  getPreviewPath,
  getTemplatePath,
} from './feAlegriaSchemas.js';

import { FORMATOS_FE_ALEGRIA } from './feAlegriaSchemas.js';

export function getFormatoDocxPath(type) {
  return FORMATOS_FE_ALEGRIA[type]?.previewPath ?? null;
}
