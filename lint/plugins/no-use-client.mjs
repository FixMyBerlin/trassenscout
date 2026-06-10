import { noUseClient } from "../rules/no-use-client.mjs"
import { createSingleRulePlugin } from "../utils/create-single-rule-plugin.mjs"

/** @type {import('eslint').ESLint.Plugin} */
export default createSingleRulePlugin("trassenscout-no-use-client", "no-use-client", noUseClient)
