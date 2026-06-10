import { requireEndpointAuth } from "../rules/require-endpoint-auth.mjs"
import { createSingleRulePlugin } from "../utils/create-single-rule-plugin.mjs"

/** @type {import('eslint').ESLint.Plugin} */
export default createSingleRulePlugin(
  "trassenscout-require-endpoint-auth",
  "require-endpoint-auth",
  requireEndpointAuth,
)
