import {
  bodyStartsWithEndpointAuth,
  getFirstEndpointAuthCall,
  hasBoundaryContextParam,
  hasValidReasonLiteral,
} from "../utils/endpoint-auth-ast.mjs"

const HTTP_METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"])

/**
 * @param {import('eslint').Rule.RuleContext} context
 * @param {import('estree').FunctionExpression | import('estree').ArrowFunctionExpression | import('estree').FunctionDeclaration} fn
 */
function checkFunction(context, fn) {
  if (!bodyStartsWithEndpointAuth(fn.body)) {
    context.report({ node: fn, messageId: "missing" })
    return
  }

  const call = getFirstEndpointAuthCall(fn.body)
  if (call && !hasValidReasonLiteral(call)) {
    context.report({
      node: call,
      messageId: "reasonRequired",
      data: { method: call.callee.property.name },
    })
  }
}

/**
 * Which functions to check is determined by oxlint `files` / `excludeFiles` — not path regex here.
 * @type {import('eslint').Rule.RuleModule}
 */
export const requireEndpointAuth = {
  meta: {
    type: "problem",
    docs: {
      description: "Require endpointAuth as the first statement in boundary functions",
    },
    messages: {
      missing:
        "First statement must call endpointAuth.<method>() or endpointAuth.public('reason') / endpointAuth.inherited('reason'). See @.agents/skills/trassenscout-auth/references/auth.md",
      reasonRequired: "endpointAuth.{{method}}() requires a non-empty string literal reason",
    },
    schema: [],
  },
  create(context) {
    return {
      ExportNamedDeclaration(node) {
        const { declaration } = node
        if (
          declaration?.type === "FunctionDeclaration" &&
          declaration.async &&
          hasBoundaryContextParam(declaration)
        ) {
          checkFunction(context, declaration)
        }
      },
      Property(node) {
        const key = node.key
        const keyName =
          key.type === "Identifier" ? key.name : key.type === "Literal" ? key.value : null

        const isHandler =
          typeof keyName === "string" && (keyName === "beforeLoad" || HTTP_METHODS.has(keyName))
        if (!isHandler) return

        const { value } = node
        if (value.type === "FunctionExpression" || value.type === "ArrowFunctionExpression") {
          checkFunction(context, value)
        }
      },
      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.type === "Identifier" &&
          node.callee.object.name === "endpointAuth" &&
          node.callee.property.type === "Identifier" &&
          (node.callee.property.name === "public" || node.callee.property.name === "inherited") &&
          !hasValidReasonLiteral(node)
        ) {
          context.report({
            node,
            messageId: "reasonRequired",
            data: { method: node.callee.property.name },
          })
        }
      },
    }
  },
}
