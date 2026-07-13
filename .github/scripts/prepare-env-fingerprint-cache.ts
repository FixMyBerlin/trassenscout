#!/usr/bin/env bun

import { mkdirSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { parseArgs } from "./shared/parse-args.ts"

function main() {
  const args = parseArgs(process.argv)
  const cacheKey = args.get("cache-key") ?? ""
  const artifactName = args.get("artifact-name")

  if (!artifactName) throw new Error("Missing --artifact-name")
  if (!cacheKey) {
    process.stdout.write("No cache key provided; skipping fingerprint artifact.\n")
    return
  }

  const outputDir = resolve(".ci/env-fingerprints")
  mkdirSync(outputDir, { recursive: true })
  writeFileSync(resolve(outputDir, `${artifactName}.hash`), `${cacheKey}\n`, "utf8")
  process.stdout.write(`Wrote fingerprint artifact: ${artifactName}.hash\n`)
}

main()
