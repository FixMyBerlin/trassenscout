import { defineConfig } from "oxfmt"

export default defineConfig({
  useTabs: false,
  tabWidth: 2,
  printWidth: 100,
  singleQuote: false,
  jsxSingleQuote: false,
  quoteProps: "as-needed",
  trailingComma: "all",
  semi: false,
  arrowParens: "always",
  bracketSameLine: false,
  bracketSpacing: true,
  endOfLine: "lf",
  sortImports: {
    newlinesBetween: false,
  },
  sortTailwindcss: {
    stylesheet: "src/components/shared/layouts/global.css",
    functions: ["twMerge", "twJoin", "clsx"],
  },
  sortPackageJson: true,
  ignorePatterns: [
    ".agents/skills/**",
    ".cursor/**",
    ".output/**",
    "playwright-report/**",
    "src/prisma/generated/**",
    "src/routeTree.gen.ts",
    "test-results/**",
  ],
})
