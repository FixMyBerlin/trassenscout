/** Resolves the local dev Postgres container name (must match docker-compose.override.yml). */
export function getDevDbContainerName(env: NodeJS.ProcessEnv = process.env) {
  const prefix = env.COMPOSE_DEV_CONTAINER_PREFIX ?? ""
  return `${prefix}ts-db`
}
