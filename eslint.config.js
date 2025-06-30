/** @type {import('eslint').Linter.Config} */
const tsParser    = require('@typescript-eslint/parser');
const tsPlugin    = require('@typescript-eslint/eslint-plugin');
const reactPlugin = require('eslint-plugin-react');

module.exports = [
  {
    // match every TS / TSX file in the repo
    files: ['**/*.{ts,tsx}'],

    // tell ESLint how to parse them
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },

    // register plugins
    plugins: { '@typescript-eslint': tsPlugin, react: reactPlugin },

    rules: {
      // @typescript-eslint recommended rules
      ...tsPlugin.configs.recommended.rules,

      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react':     'off',
    },
    settings: {
      react: { version: 'detect' }
    },
  },
];
