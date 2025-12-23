import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // TypeScript strict rules
      "@typescript-eslint/no-explicit-any": "error", // Cấm dùng any
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ], // Cấm biến không sử dụng (trừ biến bắt đầu bằng _)

      // General JavaScript rules
      "no-var": "error", // Cấm dùng var, phải dùng let/const
      eqeqeq: ["error", "always"], // Bắt buộc dùng === thay vì ==
      "no-duplicate-imports": "error", // Cấm import cùng một module nhiều lần
    },
  },
];

export default eslintConfig;
