/** @type {import('eslint').Rule.RuleModule} */
export const noReExport = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow pass-through re-exports (export … from)",
    },
    messages: {
      default:
        'Avoid re-exporting from "{{source}}". Import from the defining module directly. See .cursor/rules/react.mdc (barrel files).',
    },
    schema: [],
  },
  create(context) {
    return {
      ExportNamedDeclaration(node) {
        if (!node.source) return

        const source = node.source
        if (source.type !== "Literal" || typeof source.value !== "string") return

        context.report({
          node,
          messageId: "default",
          data: { source: source.value },
        })
      },
      ExportAllDeclaration(node) {
        const source = node.source
        if (source.type !== "Literal" || typeof source.value !== "string") return

        context.report({
          node,
          messageId: "default",
          data: { source: source.value },
        })
      },
    }
  },
}
