module.exports = {
  env: {
    es6: true,
    node: true,
    browser: true
  },
  extends: ['plugin:react/recommended', 'standard', 'standard-react'],
  plugins: ['react', 'react-hooks'],
  parser: 'babel-eslint',
  rules: {
    // React Hooks rules.
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    // Allow no-multi-str.
    'no-multi-str': 'off'
  }
}
