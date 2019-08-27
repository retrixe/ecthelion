module.exports = {
  env: {
    es6: true,
    node: true,
    browser: true
  },
  extends: ['plugin:react/recommended', 'standard', 'standard-react'],
  plugins: ['react', 'typescript'],
  parser: 'babel-eslint',
  rules: {
    // TypeScript styling.
    'typescript/no-explicit-any': ['error'],
    'typescript/type-annotation-spacing': ['error'],
    'typescript/no-namespace': ['error'],
    'typescript/interface-name-prefix': ['error'],
    'typescript/no-angle-bracket-type-assertion': ['error'],
    // Fix no-unused-vars.
    'typescript/no-unused-vars': ['error']
  }
}
