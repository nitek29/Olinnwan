#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to scan source files for translation keys
function extractTranslationKeys() {
  const srcPath = path.join(__dirname, '..', 'app');
  const componentsPath = path.join(__dirname, '..', 'components');
  const libPath = path.join(__dirname, '..', 'lib');

  const translationKeys = new Set();

  // Regex patterns to find translation calls
  const patterns = [
    /t\(['"`]([^'"`]+)['"`]\)/g, // t('key')
    /t\(['"`]([^'"`]+)['"`],/g, // t('key', options)
    /useTranslation\(['"`]([^'"`]+)['"`]\)/g, // useTranslation('namespace')
  ];

  function scanDirectory(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dirPath, file.name);

      if (file.isDirectory()) {
        scanDirectory(fullPath);
      } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');

        patterns.forEach((pattern) => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            translationKeys.add(match[1]);
          }
        });
      }
    }
  }

  // Scan all relevant directories
  [srcPath, componentsPath, libPath].forEach(scanDirectory);

  return Array.from(translationKeys).sort();
}
