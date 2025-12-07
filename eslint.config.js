import path from "node:path";
import { fileurltopath } from "node:url";

import { fixupconfigrules, fixuppluginrules } from "@eslint/compat";
import { flatcompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescripteslint from "@typescript-eslint/eslint-plugin";
import typescriptparser from "@typescript-eslint/parser";
import simpleimportsort from "eslint-plugin-simple-import-sort";

const __filename = fileurltopath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new flatcompat({
  basedirectory: __dirname,
  recommendedconfig: js.configs.recommended,
  allconfig: js.configs.all,
});

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "public/**",
      "*.config.js",
      "*.config.mjs",
      "*.config.cjs",
    ],
  },
  ...fixupconfigrules(compat.extends(
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:jsx-a11y/recommended",
    "plugin:react-hooks/recommended",
  )),
  {
    plugins: {
      "@typescript-eslint": fixuppluginrules(typescripteslint),
      "simple-import-sort": simpleimportsort,
    },
    languageoptions: {
      parser: typescriptparser,
      parseroptions: {
        ecmaversion: "latest",
        sourcetype: "module",
        ecmafeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/resolver": {
        typescript: {
          alwaystrytypes: true,
          project: "./tsconfig.json"
        }
      },
      "react": {
        version: "detect",
      },
    },
    rules: {
      // tắt các rule format để tránh xung đột với prettier (nếu có dùng)
      "style/*": ["off"],
      "format/*": ["off"],
      "*-indent": ["off"],
      "*-spacing": ["off"],
      "*-spaces": ["off"],
      "*-order": ["off"],
      "*-dangle": ["off"],
      "*-newline": ["off"],
      "*quotes": ["off"],
      "*semi": ["off"],

      // --- cấu hình lại phần import ---
      
      // chỉ cảnh báo (warn) nếu import chưa sắp xếp, không chặn build
      "simple-import-sort/imports": ["warn"], 
      "simple-import-sort/exports": ["warn"],
      
      // tắt hoặc warn các lỗi lặt vặt về import
      "import/first": ["warn"],
      "import/newline-after-import": ["off"], // tắt bắt buộc xuống dòng sau import
      
      // tắt cấm import sâu (như ../../../) để code thoải mái hơn
      "no-restricted-imports": ["off"],

      // --- cấu hình lại phần biến thừa (unused vars) ---

      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      
      // quan trọng: chuyển error thành warn. 
      // biến thừa sẽ hiện gạch vàng nhưng không làm fail quá trình deploy.
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsignorepattern: "^_",
        varsignorepattern: "^_",
        caughterrorsignorepattern: "^_",
        ignorerestsiblings: true // bỏ qua biến thừa khi destructuring
      }],

      // --- các rule khác ---

      "react/prop-types": ["off"], // tắt check prop-types nếu dùng ts
      "react/no-unknown-property": ["error", { ignore: ["jsx"] }],
      "react/display-name": "off", // tắt yêu cầu display name cho component

      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "jsx-a11y/alt-text": "warn", // ảnh thiếu alt chỉ cảnh báo

      "no-negated-condition": "off", // tắt bắt buộc đảo ngược điều kiện
      "no-console": ["warn", { allow: ["warn", "error"] }], // cho phép console.log khi dev, warn khi build
    },
  },
  {
    // cấu hình riêng cho sort import để nhóm các thư viện lại (vẫn giữ warn)
    files: ["**/*.[jt]s?(x)"],
    rules: {
      "simple-import-sort/imports": ["warn", {
        groups: [
          ["^\\u0000"],
          ["^react", "^"],
          ["^@/components/ui(?:/.*)?"],
          ["^@(?!(testing|ant|reduxjs)).+"],
          ["^\\.", "^\\.\\."],
        ],
      }],
    },
  },
  {
    files: ["**/*.test.[jt]s?(x)", "**/*.spec.[jt]s?(x)"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
];