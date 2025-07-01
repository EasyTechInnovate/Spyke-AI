import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  {
    files: ['server/**/*.js'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    ...eslint.configs.recommended,
    ...eslintConfigPrettier,
  },
  {
    files: ['client/**/*.js', 'client/**/*.jsx'],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true, // Enable JSX support
        },
      },
    },
    ...eslint.configs.recommended,
    ...eslintConfigPrettier,
    rules: {
      'no-console': 'warn',
      'no-useless-catch': 0,
      quotes: ['error', 'single', { allowTemplateLiterals: true }],
    },
  },
];