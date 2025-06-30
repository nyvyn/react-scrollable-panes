/* eslint-env node */
// Flat-config for ESLint v9
const js           = require('@eslint/js');
const tsParser     = require('@typescript-eslint/parser');
const tsPlugin     = require('@typescript-eslint/eslint-plugin');
const reactPlugin  = require('eslint-plugin-react');
const prettierOff  = require('eslint-config-prettier');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  js.configs.recommended,

  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { '@typescript-eslint': tsPlugin, react: reactPlugin },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,

      // React 18 rule relaxations
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },

  // turns off formatting-conflicting rules
  prettierOff,
];
