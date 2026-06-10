const DATABASE_NAME = "dbmaster"
const DATABASE_PORT = "5432"

function getDatabaseConfig() {
  const host = process.env.DATABASE_HOST
  const user = process.env.DATABASE_USER
  const password = process.env.DATABASE_PASSWORD

  if (!host || !user || !password) {
    throw new Error(
      "Missing database env. Provide DATABASE_HOST, DATABASE_USER, and DATABASE_PASSWORD.",
    )
  }

  return { host, user, password, name: DATABASE_NAME, port: DATABASE_PORT }
}

let passwordUrlEncodingWarned = false

function warnIfPasswordNeedsUrlEncoding(password: string) {
  if (password === encodeURIComponent(password) || passwordUrlEncodingWarned) return

  passwordUrlEncodingWarned = true
  console.warn(
    "[database-url] DATABASE_PASSWORD contains URL-unsafe characters (@, :, /, %, …). " +
      "They are percent-encoded in the connection string; prefer a URL-safe password in new deployments.",
  )
}

function buildDatabaseUrl(config: ReturnType<typeof getDatabaseConfig>) {
  warnIfPasswordNeedsUrlEncoding(config.password)
  return `postgresql://${encodeURIComponent(config.user)}:${encodeURIComponent(config.password)}@${config.host}:${config.port}/${config.name}`
}

export function getDatabaseUrl() {
  return buildDatabaseUrl(getDatabaseConfig())
}

/** @internal Resets one-shot warning state for tests. */
export function resetDatabaseUrlWarningsForTests() {
  passwordUrlEncodingWarned = false
}
