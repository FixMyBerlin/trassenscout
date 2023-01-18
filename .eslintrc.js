module.exports = require("@blitzjs/next/eslint");

// TODO
// We have those linters in other projects, hande i18n issues.
// However, I am not sure which ruleset this is.
// It might be part of `jsx-a11y`.
// In addition, in tarmac-app we have rules like
// - underscore variables
// - ts-ignore allowed when paired with comment
//
// We also need to figure out how to add them here.
// - https://nextjs.org/docs/basic-features/eslint
// - legacy blitz: https://github.com/blitz-js/blitz/discussions/2529#discussioncomment-911474
export const extends = ["plugin:storybook/recommended"];