import { noReExport } from "../rules/no-re-export.mjs"
import { createSingleRulePlugin } from "../utils/create-single-rule-plugin.mjs"

/** @type {import('eslint').ESLint.Plugin} */
export default createSingleRulePlugin("trassenscout-no-re-export", "no-re-export", noReExport)
