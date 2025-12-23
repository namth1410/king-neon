// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // TypeScript strict rules
      '@typescript-eslint/no-explicit-any': 'error', // Cấm dùng any
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ], // Cấm biến không sử dụng (trừ biến bắt đầu bằng _)
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      // General JavaScript rules
      'no-var': 'error', // Cấm dùng var, phải dùng let/const
      eqeqeq: ['error', 'always'], // Bắt buộc dùng === thay vì ==
      'no-duplicate-imports': 'error', // Cấm import cùng một module nhiều lần

      // Prettier
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
);
