import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set this to the root directory where your JSON schemas live
const SCHEMA_DIR = path.join(__dirname, '..', 'schemas');

// Map AnimationData categories to schema folder names
const CATEGORY_TO_FOLDER: Record<string, string> = {
  forces: 'Forces',
  fields: 'Fields',
  interactions: 'Interactions',
  materials: 'Materials',
  motions: 'Motions',
  objects: 'Objects',
  environments: 'Environments'
};

function loadSchemaFile(category: string, typeName: string): Record<string, unknown> {
  const folder = CATEGORY_TO_FOLDER[category.toLowerCase()];
  if (!folder) {
    throw new Error(`Unknown category: ${category}`);
  }

  const filePath = path.join(SCHEMA_DIR, folder, `${typeName}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

export function loadAllSchemas(animationDict: Record<string, unknown>): Record<string, unknown[]> {
  const allSchemas: Record<string, unknown[]> = {};

  for (const [category, types] of Object.entries(animationDict)) {
    allSchemas[category] = [];

    if (Array.isArray(types)) {
      for (const typeName of types) {
        // Clean enum prefix (e.g., "Forces.GravitationalForce" -> "GravitationalForce")
        const cleanTypeName = String(typeName).split('.').pop() || String(typeName);
        const schema = loadSchemaFile(category, cleanTypeName);
        allSchemas[category].push(schema);
      }
    }
  }

  return allSchemas;
}
