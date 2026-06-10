#!/usr/bin/env bun

import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { computeEnvFingerprint, type FingerprintScopesConfig } from "./shared/env-fingerprint.ts"
import { writeGithubOutput } from "./shared/github-actions.ts"
import { parseArgs } from "./shared/parse-args.ts"

const SCOPES_PATH = resolve(import.meta.dir, "..", "env", "fingerprint-scopes.json")

function readScopes(path: string) {
  const parsed = JSON.parse(readFileSync(path, "utf8")) as FingerprintScopesConfig
  if (!parsed.scopes || typeof parsed.scopes !== "object") {
    throw new Error(`Fingerprint scopes file must contain scopes object: ${path}`)
  }
  return parsed
}

function main() {
  const args = parseArgs(process.argv)
  const scope = args.get("scope") ?? ""
  const environment = args.get("environment")
  const refName = args.get("ref-name") ?? process.env.GITHUB_REF_NAME

  if (!environment) throw new Error("Missing --environment")
  if (!refName) throw new Error("Missing --ref-name or GITHUB_REF_NAME")
  if (!scope) {
    writeGithubOutput("hash", "")
    writeGithubOutput("cache_key", "")
    process.stdout.write("No fingerprint scope configured.\n")
    return
  }

  const config = readScopes(SCOPES_PATH)
  const result = computeEnvFingerprint({
    scope,
    config,
    env: process.env,
    refName,
    environment,
  })

  if (!result) {
    writeGithubOutput("hash", "")
    writeGithubOutput("cache_key", "")
    process.stdout.write(`Unknown fingerprint scope: ${scope}\n`)
    return
  }

  writeGithubOutput("hash", result.hash)
  writeGithubOutput("cache_key", result.cacheKey)
  process.stdout.write(`Environment fingerprint hash: ${result.hash}\n`)
}

main()
