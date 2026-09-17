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
    "prisma/seeds/**/*.ts",
    "lint/lint.test.mjs",
    "src/server/instrumentation/**/*.ts",
  ],
  ignoreDependencies: ["estree", "eslint"],
  ignore: ["imap-listener/**", ".agents/**"],
  ignoreIssues: {
    "src/server/**/*.ts": ["duplicates"],
    "src/shared/**/*.ts": ["duplicates"],
    "emails/**": ["duplicates"],
    "tests/_utils/testDb.ts": ["unresolved"],
  },
  paths: {
    "@/*": ["./*"],
  },
  ignoreBinaries: ["code", "gh", "pg_isready", "rg", "which", "psql"],
}
