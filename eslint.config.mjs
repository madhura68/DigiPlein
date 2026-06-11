import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],
      // ADR-0001 — shadcn/ui op @base-ui/react. Geen Radix, geen `asChild`.
      "no-restricted-imports": ["error", {
        patterns: [{
          group: ["@radix-ui", "@radix-ui/*"],
          message: "ADR-0001: gebruik @base-ui/react met de `render`-prop, niet Radix.",
        }],
      }],
      "no-restricted-syntax": ["error", {
        selector: "JSXAttribute[name.name='asChild']",
        message: "ADR-0001: gebruik de `render`-prop van @base-ui/react, niet `asChild`.",
      }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    ".claude/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
