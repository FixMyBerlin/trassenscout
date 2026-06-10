const USE_CLIENT_DIRECTIVE = "use client"

/**
 * @param {import('estree').Statement | import('estree').ModuleDeclaration} statement
 */
function isUseClientDirective(statement) {
  return (
    statement.type === "ExpressionStatement" &&
    statement.expression.type === "Literal" &&
    statement.expression.value === USE_CLIENT_DIRECTIVE
  )
}

/** @type {import('eslint').Rule.RuleModule} */
export const noUseClient = {
  meta: {
    type: "problem",
    docs: {
      description: 'Disallow Next.js "use client" directives in TanStack Start source files',
    },
    fixable: "code",
    messages: {
      default:
        'Remove "{{directive}}". TanStack Start has no client boundary directive — components are isomorphic by default; use createServerFn for server-only code. See lint/plugins/no-use-client.mjs',
    },
    schema: [],
  },
  create(context) {
    return {
      Program(node) {
        for (const statement of node.body) {
          if (!isUseClientDirective(statement)) break

          context.report({
            node: statement,
            messageId: "default",
            data: { directive: USE_CLIENT_DIRECTIVE },
            fix(fixer) {
              return fixer.remove(statement)
            },
          })
        }
      },
    }
  },
}
