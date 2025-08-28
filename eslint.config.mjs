import { config as baseConfig } from '@repo/eslint-config/base';
import { nextJsConfig as nextConfig } from '@repo/eslint-config/next-js';
import { config as reactConfig } from '@repo/eslint-config/react-internal';

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...baseConfig,
  ...nextConfig.map(config => ({
    ...config,
    files: ['apps/web/**/*.ts', 'apps/web/**/*.tsx'],
  })),
  ...reactConfig.map(config => ({
    ...config,
    files: ['packages/ui/**/*.ts', 'packages/ui/**/*.tsx'],
  })),
];
