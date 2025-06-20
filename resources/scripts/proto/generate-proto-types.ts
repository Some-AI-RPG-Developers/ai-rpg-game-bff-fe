import {spawn} from 'child_process';
import {existsSync, mkdirSync} from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

// Get dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use the local proto file
const PROTO_PATH = path.resolve(__dirname, '../../proto/game_service.proto');
const TYPES_OUTPUT_DIR = path.resolve(__dirname, '../../../src/server/types/proto');

// Make sure the proto types directory exists
if (!existsSync(TYPES_OUTPUT_DIR)) {
  mkdirSync(TYPES_OUTPUT_DIR, { recursive: true });
}

// Ensure the proto file exists
if (!existsSync(PROTO_PATH)) {
  console.error(`Error: Proto file not found at ${PROTO_PATH}`);
  process.exit(1);
}

function runProtoGeneration(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Generating TypeScript types from ${PROTO_PATH}...`);
    
    const args = [
      'protoc',
      `--plugin=./node_modules/.bin/protoc-gen-ts_proto`,
      `--ts_proto_out=${TYPES_OUTPUT_DIR}`,
      `--ts_proto_opt=esModuleInterop=true`,
      `--ts_proto_opt=outputServices=grpc-js`,
      `--ts_proto_opt=useOptionals=messages`,
      `--proto_path=${path.dirname(PROTO_PATH)}`,
      PROTO_PATH
    ];
    
    console.log(`Running: ${args.join(' ')}`);
    
    const child = spawn(args[0], args.slice(1), {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`Proto types successfully generated at ${TYPES_OUTPUT_DIR}`);
        resolve();
      } else {
        reject(new Error(`protoc exited with code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

try {
  await runProtoGeneration();
} catch (error) {
  console.error('Error generating proto types:', error);
  process.exit(1);
} 