import { createHash } from "node:crypto"

export type FingerprintScopesConfig = {
  scopes: Record<string, string[]>
}

export function buildFingerprintLines(
  scope: string,
  config: FingerprintScopesConfig,
  env: NodeJS.ProcessEnv,
) {
  const variables = config.scopes[scope]
  if (!variables) return null
  return variables.map((name) => `${name}=${env[name] ?? ""}`)
}

export function hashFingerprintLines(lines: string[]) {
  return createHash("sha256").update(lines.join("\n")).digest("hex")
}

export function buildCacheKey({
  refName,
  environment,
  scope,
  hash,
}: {
  refName: string
  environment: string
  scope: string
  hash: string
}) {
  return `env-fingerprint-${refName}-${environment}-${scope}-${hash}`
}

export function computeEnvFingerprint({
  scope,
  config,
  env,
  refName,
  environment,
}: {
  scope: string
  config: FingerprintScopesConfig
  env: NodeJS.ProcessEnv
  refName: string
  environment: string
}) {
  const lines = buildFingerprintLines(scope, config, env)
  if (!lines) return null
  const hash = hashFingerprintLines(lines)
  const cacheKey = buildCacheKey({ refName, environment, scope, hash })
  return { hash, cacheKey }
}

export function resolveEnvChanges(hash: string, cacheHit: string) {
  if (!hash) return false
  if (cacheHit === "true") return false
  return true
}

export function mergeChangeSignals(gitChanges: string, envChanges: string) {
  return gitChanges === "true" || envChanges === "true"
}
