/** @type {import('knip').KnipConfig} */
export default {
  entry: [
    "src/router.tsx",
    "src/routes/**/*.ts",
    "src/routes/**/*.tsx",
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "scripts/**/*.ts",
    "tests/**/*.ts",
    "emails/**/*.ts",
    "emails/**/*.tsx",
    "prisma/seed.ts",
    "prisma/seeds/**/*.ts",
    "lint/lint.test.mjs",
    "src/server/instrumentation/**/*.ts",
  ],
  ignoreDependencies: ["estree"],
  ignore: ["imap-listener/**", ".agents/**", "_migration/**"],
  ignoreIssues: {
    "src/server/**/*.ts": ["duplicates"],
  },
  paths: {
    "@/*": ["./*"],
  },
  ignoreBinaries: ["code", "gh", "pg_isready", "rg"],
}
