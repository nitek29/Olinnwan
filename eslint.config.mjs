import { config as baseConfig } from '@repo/eslint-config/base';
import { nextJsConfig as nextConfig } from '@repo/eslint-config/next-js';
import { config as reactConfig } from '@repo/eslint-config/react-internal';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  {
    files: ['apps/web/**/*.ts', 'apps/web/**/*.tsx'],
    ...nextConfig,
  },
  {
    files: ['packages/ui/**/*.ts', 'packages/ui/**/*.tsx'],
    ...reactConfig,
  },
];
