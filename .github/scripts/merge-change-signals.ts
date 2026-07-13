#!/usr/bin/env bun

import { mergeChangeSignals } from "./shared/env-fingerprint.ts"
import { writeGithubOutput } from "./shared/github-actions.ts"
import { parseArgs } from "./shared/parse-args.ts"

function main() {
  const args = parseArgs(process.argv)
  const gitChanges = args.get("git-changes") ?? "false"
  const envChanges = args.get("env-changes") ?? "false"

  const hasChanges = mergeChangeSignals(gitChanges, envChanges)
  writeGithubOutput("CHANGES", hasChanges ? "true" : "false")
  process.stdout.write(hasChanges ? "Deploy required.\n" : "No deploy required.\n")
}

main()
