/**
 * @param {string} name oxlint plugin name (used as rule prefix)
 * @param {string} ruleId rule id within the plugin
 * @param {import('eslint').Rule.RuleModule} rule
 */
export function createSingleRulePlugin(name, ruleId, rule) {
  return {
    meta: { name },
    rules: { [ruleId]: rule },
  }
}
