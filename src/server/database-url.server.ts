const DATABASE_NAME = "dbmaster"
const DEPLOY_DATABASE_PORT = "5432"
const LOCAL_DEV_DATABASE_PORT = "5435"

function resolveDatabasePort(host: string) {
  // Compose service `db` always listens on 5432 inside the network (incl. dev `frontend` profile).
  if (host === "db") return DEPLOY_DATABASE_PORT
  if (process.env.VITE_APP_ENV === "development") return LOCAL_DEV_DATABASE_PORT
  return DEPLOY_DATABASE_PORT
}

function getDatabaseConfig() {
  const host = process.env.DATABASE_HOST
  const user = process.env.DATABASE_USER
  const password = process.env.DATABASE_PASSWORD

  if (!host || !user || !password) {
    throw new Error(
      "Missing database env. Provide DATABASE_HOST, DATABASE_USER, and DATABASE_PASSWORD.",
    )
  }

  const port = resolveDatabasePort(host)

  return { host, user, password, name: DATABASE_NAME, port }
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
