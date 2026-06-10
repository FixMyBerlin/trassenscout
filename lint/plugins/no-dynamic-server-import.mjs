import { noDynamicServerImport } from "../rules/no-dynamic-server-import.mjs"
import { createSingleRulePlugin } from "../utils/create-single-rule-plugin.mjs"

/** @type {import('eslint').ESLint.Plugin} */
export default createSingleRulePlugin(
  "trassenscout-no-dynamic-server-import",
  "no-dynamic-server-import",
  noDynamicServerImport,
)
