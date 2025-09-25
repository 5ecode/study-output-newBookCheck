import vueParser from 'vue-eslint-parser';
import tsParser from '@typescript-eslint/parser';
import vue from 'eslint-plugin-vue';

export default [
  {
    files: ['**/*.js', '**/*.ts', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2021,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      vue,
    },
    rules: {
      quotes: ['error', 'single'],
      indent: ['error', 2],
      semi: ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
    },
  },
];
