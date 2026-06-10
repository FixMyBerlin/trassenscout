/** Pure AST helpers for endpointAuth.* call detection. No file-path or domain logic. */

const REASON_METHODS = new Set(["public", "inherited"])

/**
 * Closed allowlist of route layout gates from `src/server/auth/auth.functions.ts`.
 *
 * Route `beforeLoad` cannot call `endpointAuth.session()` / `projectRole()` directly:
 * those throw `AuthorizationError`, but layouts must `redirect()` (login, access-denied,
 * dashboard). The real checks live in `route*Fn` server functions — thin wrappers around
 * the same session helpers, exported specifically for TanStack Router `beforeLoad`.
 *
 * The lint rule still requires the first `beforeLoad` statement to be an auth boundary.
 * Without this set, every layout would need a no-op `endpointAuth.inherited(...)` before
 * calling `routeSessionFn`, or we'd falsely flag valid guards as missing auth.
 *
 * Intentionally coupled: only these four names are valid route gates. Renaming or adding
 * one requires updating both `auth.functions.ts` and this list (see lint/lint.test.mjs).
 */
const ROUTE_AUTH_FNS = new Set(["routeGuestFn", "routeSessionFn", "routeAdminFn", "routeProjectFn"])

/**
 * @param {import('estree').Node | null | undefined} node
 */
function isRouteAuthFnCall(node) {
  if (!node) return false
  const target = node.type === "AwaitExpression" ? node.argument : node
  if (!target || target.type !== "CallExpression") return false
  const { callee } = target
  return callee.type === "Identifier" && ROUTE_AUTH_FNS.has(callee.name)
}

/**
 * @param {import('estree').Node | null | undefined} node
 */
function isEndpointAuthCall(node) {
  if (isRouteAuthFnCall(node)) return true
  if (!node) return false
  const target = node.type === "AwaitExpression" ? node.argument : node
  if (!target || target.type !== "CallExpression") return false
  const { callee } = target
  return (
    callee.type === "MemberExpression" &&
    callee.object.type === "Identifier" &&
    callee.object.name === "endpointAuth" &&
    callee.property.type === "Identifier"
  )
}

/**
 * @param {import('estree').Statement} statement
 */
function statementHasEndpointAuth(statement) {
  if (statement.type === "ExpressionStatement") {
    return isEndpointAuthCall(statement.expression)
  }
  if (statement.type === "VariableDeclaration") {
    return statement.declarations.some((decl) => isEndpointAuthCall(decl.init))
  }
  if (statement.type === "ReturnStatement") {
    return isEndpointAuthCall(statement.argument)
  }
  return false
}

/**
 * Thin API route delegators: `return handler(...)` as first statement.
 * @param {import('estree').Statement} statement
 */
function isDelegateReturn(statement) {
  if (statement.type !== "ReturnStatement" || !statement.argument) return false
  const arg = statement.argument
  if (arg.type === "CallExpression" && arg.callee.type === "Identifier") return true
  if (arg.type === "AwaitExpression" && arg.argument?.type === "CallExpression") {
    return arg.argument.callee.type === "Identifier"
  }
  return false
}

/**
 * @param {import('estree').BlockStatement | import('estree').Expression | null | undefined} body
 */
export function bodyStartsWithEndpointAuth(body) {
  if (!body) return false
  if (body.type !== "BlockStatement") {
    return isEndpointAuthCall(body)
  }

  const statements = body.body.filter((statement) => statement.type !== "EmptyStatement")
  const first = statements[0]
  if (!first) return false
  if (statementHasEndpointAuth(first)) return true
  return isDelegateReturn(first)
}

/**
 * @param {import('estree').FunctionExpression | import('estree').ArrowFunctionExpression | import('estree').FunctionDeclaration} fn
 */
export function hasBoundaryContextParam(fn) {
  const [first] = fn.params
  return first?.type === "Identifier" && (first.name === "headers" || first.name === "request")
}

/**
 * @param {import('estree').CallExpression} call
 * @returns {string | null}
 */
function getEndpointAuthMethodName(call) {
  const { callee } = call
  if (callee.type !== "MemberExpression" || callee.property.type !== "Identifier") return null
  if (callee.object.type !== "Identifier" || callee.object.name !== "endpointAuth") return null
  return callee.property.name
}

/**
 * @param {import('estree').CallExpression} call
 */
export function hasValidReasonLiteral(call) {
  const method = getEndpointAuthMethodName(call)
  if (!method || !REASON_METHODS.has(method)) return true
  const [reason] = call.arguments
  return (
    reason?.type === "Literal" && typeof reason.value === "string" && reason.value.trim() !== ""
  )
}

/**
 * First endpointAuth call expression in a function body, if any.
 * @param {import('estree').BlockStatement | import('estree').Expression} body
 */
export function getFirstEndpointAuthCall(body) {
  if (body.type !== "BlockStatement") {
    const node = body.type === "AwaitExpression" ? body.argument : body
    return node?.type === "CallExpression" && isEndpointAuthCall(node) ? node : null
  }

  const first = body.body.find((statement) => statement.type !== "EmptyStatement")
  if (!first) return null

  let expression = null
  if (first.type === "ExpressionStatement") expression = first.expression
  if (first.type === "VariableDeclaration") expression = first.declarations[0]?.init ?? null

  if (!expression) return null
  const call = expression.type === "AwaitExpression" ? expression.argument : expression
  return call?.type === "CallExpression" && isEndpointAuthCall(call) ? call : null
}
