import { noAuthBoundaryImport } from "../rules/no-auth-boundary-import.mjs"
import { createSingleRulePlugin } from "../utils/create-single-rule-plugin.mjs"

/** @type {import('eslint').ESLint.Plugin} */
export default createSingleRulePlugin(
  "trassenscout-no-auth-boundary-import",
  "no-auth-boundary-import",
  noAuthBoundaryImport,
)
