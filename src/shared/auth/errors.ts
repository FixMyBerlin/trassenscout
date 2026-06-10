export const authMessages = {
  adminAccessRequired: "Admin access required.",
  notAuthenticated: "Not authenticated.",
  forbiddenAccess: "Sie haben keine Berechtigung für diese Seite.",
} as const

function isErrorWithMessage(error: unknown, message: string) {
  return error instanceof Error && error.message === message
}

/** Session missing — including plain Errors after server-fn deserialization. */
export function isNotAuthenticatedError(error: unknown) {
  return (
    error instanceof AuthenticationError ||
    (error instanceof AuthorizationError && error.message === authMessages.notAuthenticated) ||
    isErrorWithMessage(error, authMessages.notAuthenticated)
  )
}

function isAdminAccessRequiredError(error: unknown) {
  return (
    (error instanceof AuthorizationError && error.message === authMessages.adminAccessRequired) ||
    isErrorWithMessage(error, authMessages.adminAccessRequired)
  )
}

function isForbiddenAccessError(error: unknown) {
  return isErrorWithMessage(error, authMessages.forbiddenAccess)
}

export function isAuthorizationError(error: unknown): error is AuthorizationError {
  return (
    isNotAuthenticatedError(error) ||
    isAdminAccessRequiredError(error) ||
    isForbiddenAccessError(error) ||
    error instanceof AuthorizationError ||
    (error instanceof Error && error.name === "AuthorizationError")
  )
}

export class AuthorizationError extends Error {
  readonly statusCode = 401

  constructor(message: string = authMessages.notAuthenticated) {
    super(message)
    this.name = "AuthorizationError"
  }
}

export class AuthenticationError extends Error {
  readonly statusCode = 401

  constructor(message: string = authMessages.notAuthenticated) {
    super(message)
    this.name = "AuthenticationError"
  }
}

export class NotFoundError extends Error {
  readonly statusCode = 404

  constructor(message = "Not Found") {
    super(message)
    this.name = "NotFoundError"
  }
}

export function authErrorToResponse(error: unknown) {
  if (error instanceof AuthorizationError) {
    return new Response("Unauthorized", { status: error.statusCode })
  }
  return null
}
