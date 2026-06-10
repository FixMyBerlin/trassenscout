/** @type {import('eslint').Rule.RuleModule} */
export const noDynamicServerImport = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow dynamic import() of *.server modules in server function files",
    },
    messages: {
      default:
        'Use a static top-level import for "{{source}}" instead of await import(). See lint/plugins/no-dynamic-server-import.mjs',
    },
    schema: [],
  },
  create(context) {
    return {
      ImportExpression(node) {
        const source = node.source
        if (source.type !== "Literal" || typeof source.value !== "string") return
        if (!/\.server($|[?#])/.test(source.value)) return

        context.report({
          node: source,
          messageId: "default",
          data: { source: source.value },
        })
      },
    }
  },
}
