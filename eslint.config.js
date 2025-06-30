/** @type {import('eslint').Linter.Config} */
module.exports = [
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react':     'off',
    },
    settings: {
      react: { version: 'detect' }
    },
  },
];
