import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import eslintConfigPrettierFlat from 'eslint-config-prettier/flat'
import standardJsx from 'eslint-config-standard-jsx'
import standardReact from 'eslint-config-standard-react'
import importPlugin from 'eslint-plugin-import'
import nodePlugin from 'eslint-plugin-n'
import pluginPromise from 'eslint-plugin-promise'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['.pnp.cjs', '.pnp.loader.mjs', '.yarn', '.next', 'out', '*.config.{mjs,js}'],
  },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  react.configs.flat.recommended,
  pluginPromise.configs['flat/recommended'],
  importPlugin.flatConfigs.recommended, // Could use TypeScript resolver
  nodePlugin.configs['flat/recommended-module'],
  nextPlugin.configs['core-web-vitals'],
  reactHooks.configs.flat.recommended,
  { rules: standardJsx.rules },
  { rules: standardReact.rules },
  {
    settings: { react: { version: 'detect' } },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-import-type-side-effects': ['error'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: true, // TODO: Turn this off!
          allowNumber: true,
          allowRegExp: false,
          allowNever: false,
        },
      ],
      'promise/no-nesting': 'off', // TODO: Re-enable!
      'promise/always-return': ['error', { ignoreLastCallback: true }],
      'n/no-missing-import': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
      'n/no-unsupported-features/es-syntax': 'off',
      'import/no-unresolved': 'off',
    },
  },
  eslintConfigPrettierFlat,
)
