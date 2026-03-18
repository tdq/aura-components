import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROUTER_DOC_PATH = join(__dirname, '../../../../.agent/router.md');

export function getRouterDocs() {
  if (!existsSync(ROUTER_DOC_PATH)) {
    return { error: 'Router documentation not found.' };
  }
  return {
    docs: readFileSync(ROUTER_DOC_PATH, 'utf8'),
  };
}
