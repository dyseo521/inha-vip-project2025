import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootPackage = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

const functionsDir = join(__dirname, '../dist/functions');
const functionDirs = readdirSync(functionsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

for (const funcName of functionDirs) {
  const packageJson = {
    name: `eecar-${funcName}`,
    version: '1.0.0',
    type: 'module',
    dependencies: rootPackage.dependencies
  };

  const packagePath = join(functionsDir, funcName, 'package.json');
  writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  console.log(`Created package.json for ${funcName}`);
}
