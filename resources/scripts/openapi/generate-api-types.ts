import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the local OpenAPI file
const OPENAPI_PATH = path.resolve(__dirname, '../../api/openapi.yaml');
const TYPES_OUTPUT_PATH = path.resolve(__dirname, '../../../src/types/rest/api.types.ts');

// Make sure the types directory exists
const typesDir = path.resolve(__dirname, '../../../src/types');
if (!existsSync(typesDir)) {
  mkdirSync(typesDir, { recursive: true });
}

try {
  // Use openapi-typescript to generate types from the OpenAPI spec
  console.log(`Generating TypeScript types from ${OPENAPI_PATH}...`);
  const command = `npx openapi-typescript ${OPENAPI_PATH} -o ${TYPES_OUTPUT_PATH}`;
  execSync(command, { stdio: 'inherit' });
  console.log(`Types successfully generated at ${TYPES_OUTPUT_PATH}`);
} catch (error) {
  console.error('Error generating TypeScript types:', error);
  process.exit(1);
} 