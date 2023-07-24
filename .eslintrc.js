// well....
if (require('eslint-config-standard-with-typescript/package.json').version === '37.0.0') {
  console.log('Patching eslint-config-standard-with-typescript for TypeScript ESLint 6 support.')
  const fs = require('fs')
  const path = require('path')
  const target = path.join(__dirname, 'node_modules', 'eslint-config-standard-with-typescript', 'lib', 'index.js')
  const contents = fs.readFileSync(target, { encoding: 'utf8' }).split('\n')
    .filter(line => !line.includes('restrict-plus-operands'))
    .join('\n')
  fs.writeFileSync(target, contents, { encoding: 'utf8' })
}

module.exports = {
  env: {
    es6: true,
    node: true,
    browser: true
  },
  extends: ['plugin:@next/next/recommended', 'plugin:react/recommended', 'standard-with-typescript', 'standard-react', 'standard-jsx'],
  plugins: ['react', 'react-hooks', '@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json'
  },
  ignorePatterns: ['.eslintrc.js', 'next.config.js', 'jest.config.js', 'out'],
  rules: {
    // React Hooks rules.
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    // Make TypeScript ESLint less strict.
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/triple-slash-reference': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'off',
    'multiline-ternary': 'off', // Temporary.
    // Allow no-multi-str.
    'no-multi-str': 'off'
  }
}
