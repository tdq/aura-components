import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getManifest } from '../manifest.js';

// Resolve monorepo root (packages/mcp-server/src/tools -> ../../../../)
const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENT_COMPONENTS_DIR = join(__dirname, '../../../../.agent/components');

export function getComponentGuide(name: string) {
  const manifest = getManifest();
  const component = manifest.components.find(
    c => c.name.toLowerCase() === name.toLowerCase() ||
         c.componentName.toLowerCase() === name.toLowerCase()
  );
  if (!component) {
    return { error: `Component "${name}" not found. Use list_components to see available components.` };
  }

  const compName = component.componentName;
  // Try flat file first, then subdirectory pattern
  const flatPath = join(AGENT_COMPONENTS_DIR, `${compName}.md`);
  const subPath = join(AGENT_COMPONENTS_DIR, compName, `${compName}.md`);

  let filePath = '';
  if (existsSync(flatPath)) filePath = flatPath;
  else if (existsSync(subPath)) filePath = subPath;

  if (!filePath) {
    return { error: `No guide found for component "${name}". The component exists but has no documentation file.` };
  }

  return {
    name: component.name,
    componentName: compName,
    guide: readFileSync(filePath, 'utf8'),
  };
}
