#!/usr/bin/env bun

import { resolveEnvChanges } from "./shared/env-fingerprint.ts"
import { writeGithubOutput } from "./shared/github-actions.ts"
import { parseArgs } from "./shared/parse-args.ts"

function main() {
  const args = parseArgs(process.argv)
  const hash = args.get("hash") ?? ""
  const cacheHit = args.get("cache-hit") ?? ""

  const hasChanges = resolveEnvChanges(hash, cacheHit)
  writeGithubOutput("CHANGES", hasChanges ? "true" : "false")
  process.stdout.write(
    hasChanges ? "Environment changes detected.\n" : "No environment changes detected.\n",
  )
}

main()
