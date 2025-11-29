import path from "node:path";
import { fileURLToPath } from "node:url";

import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
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
  ...fixupConfigRules(compat.extends(
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
      "@typescript-eslint": fixupPluginRules(typescriptEslint),
      "simple-import-sort": simpleImportSort,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
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
          alwaysTryTypes: true,
          project: "./tsconfig.json"
        }
      },
      "react": {
        version: "detect",
      },
    },
    rules: {
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

      "simple-import-sort/imports": ["error"],
      "simple-import-sort/exports": ["error"],
      "import/first": ["error"],
      "import/newline-after-import": ["error", { count: 1 }],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["..\/..\/.+", "..\/..\/..\/.+"],
              message: "Don't use deeply nested parent imports.",
            },
          ]
        },
      ],

      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": ["error", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],

      "react/prop-types": ["error", { skipUndeclared: true }],
      "react/no-unknown-property": ["error", { ignore: ["jsx"] }],

      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-static-element-interactions": "off",

      "no-negated-condition": "error",
    },
  },
  {
    files: ["**/*.[jt]s?(x)"],
    rules: {
      "simple-import-sort/imports": ["error", {
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
