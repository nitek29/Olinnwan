#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES = ['en', 'fr', 'es', 'pt'];
const DEFAULT_LOCALE = 'en';

// Function to extract all translation keys from a translation object
function extractKeys(obj, prefix = '') {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      keys.push(...extractKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

// Function to validate translation completeness
function validateTranslations() {
  const localesPath = path.join(__dirname, '..', 'public', 'locales');

  if (!fs.existsSync(localesPath)) {
    console.error('❌ Locales directory not found');
    return false;
  }

  const defaultLocalePath = path.join(localesPath, DEFAULT_LOCALE);

  if (!fs.existsSync(defaultLocalePath)) {
    console.error(`❌ Default locale (${DEFAULT_LOCALE}) directory not found`);
    return false;
  }

  // Get all namespace files from default locale
  const namespaceFiles = fs
    .readdirSync(defaultLocalePath)
    .filter((file) => file.endsWith('.json'));

  if (namespaceFiles.length === 0) {
    console.error(`❌ No translation files found in ${DEFAULT_LOCALE}`);
    return false;
  }

  let hasErrors = false;

  for (const namespaceFile of namespaceFiles) {
    const namespace = namespaceFile.replace('.json', '');
    console.log(`\n📋 Validating namespace: ${namespace}`);

    // Load default locale keys
    const defaultFilePath = path.join(defaultLocalePath, namespaceFile);
    const defaultTranslations = JSON.parse(
      fs.readFileSync(defaultFilePath, 'utf8')
    );
    const defaultKeys = extractKeys(defaultTranslations);

    console.log(`   Found ${defaultKeys.length} keys in ${DEFAULT_LOCALE}`);

    // Check each locale
    for (const locale of LOCALES) {
      if (locale === DEFAULT_LOCALE) continue;

      const localeFilePath = path.join(localesPath, locale, namespaceFile);

      if (!fs.existsSync(localeFilePath)) {
        console.error(`   ❌ ${locale}: Missing file ${namespaceFile}`);
        hasErrors = true;
        continue;
      }

      const localeTranslations = JSON.parse(
        fs.readFileSync(localeFilePath, 'utf8')
      );
      const localeKeys = extractKeys(localeTranslations);

      // Find missing keys
      const missingKeys = defaultKeys.filter(
        (key) => !localeKeys.includes(key)
      );
      const extraKeys = localeKeys.filter((key) => !defaultKeys.includes(key));

      if (missingKeys.length > 0) {
        console.error(
          `   ❌ ${locale}: Missing keys: ${missingKeys.join(', ')}`
        );
        hasErrors = true;
      }

      if (extraKeys.length > 0) {
        console.warn(`   ⚠️  ${locale}: Extra keys: ${extraKeys.join(', ')}`);
      }

      if (missingKeys.length === 0 && extraKeys.length === 0) {
        console.log(`   ✅ ${locale}: Complete (${localeKeys.length} keys)`);
      }
    }
  }

  if (hasErrors) {
    console.error('\n❌ Translation validation failed!');
    console.error('Please fix the missing translations before committing.');
    return false;
  } else {
    console.log('\n✅ All translations are complete!');
    return true;
  }
}

validateTranslations();
