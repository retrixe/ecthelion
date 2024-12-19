import love from 'eslint-config-love'
import standardJsx from 'eslint-config-standard-jsx'
import standardReact from 'eslint-config-standard-react'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  {
    ignores: ['.pnp.cjs', '.pnp.loader.mjs', '.yarn', '.next'],
  },
  {
    ...love,
    files: [
      '__tests__/**/*.{js,ts,tsx}',
      'imports/**/*.{js,ts,tsx}',
      'pages/**/*.{js,ts,tsx}',
    ],
  },
  { ...react.configs.flat.recommended, settings: { react: { version: 'detect' } } },
  { plugins: { 'react-hooks': reactHooks }, rules: reactHooks.configs.recommended.rules },
  { rules: standardJsx.rules },
  { rules: standardReact.rules },
  {
    rules: {
      // Make TypeScript ESLint less strict.
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      'multiline-ternary': 'off', // Temporary.
      // Allow no-multi-str.
      'no-multi-str': 'off',
      // Make ESLint Config Love less strict. Perhaps move to ESLint+TS-ESLint+import+promise+n?
      '@typescript-eslint/max-params': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unsafe-type-assertion': 'off',
      '@typescript-eslint/class-methods-use-this': 'off',
      '@typescript-eslint/prefer-destructuring': 'off',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
      'complexity': 'off',
      'promise/avoid-new': 'off',
      '@typescript-eslint/init-declarations': 'off',
      '@typescript-eslint/no-loop-func': 'off',
    },
  },
]
