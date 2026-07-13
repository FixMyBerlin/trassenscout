#!/usr/bin/env bun

import { spawnSync } from "node:child_process"
import { writeGithubOutput } from "./shared/github-actions.ts"
import { parseArgs } from "./shared/parse-args.ts"

function main() {
  const args = parseArgs(process.argv)
  const lastRunSha = args.get("last-run-sha") ?? ""
  const currentSha = args.get("current-sha") ?? process.env.GITHUB_SHA
  const locations = args.get("locations")

  if (!currentSha) throw new Error("Missing --current-sha or GITHUB_SHA")
  if (!locations) throw new Error("Missing --locations")

  if (!lastRunSha) {
    writeGithubOutput("CHANGES", "true")
    process.stdout.write("No previous successful run; treating as changed.\n")
    return
  }

  const paths = locations.split(/\s+/).filter(Boolean)
  // --quiet suppresses the diff output (which can exceed spawnSync's buffer) and implies --exit-code
  const result = spawnSync(
    "git",
    ["diff", "--quiet", lastRunSha, currentSha, "--", ...paths, ".github/workflows/"],
    { encoding: "utf8" },
  )

  if (result.error) throw result.error
  if (result.status !== 0 && result.status !== 1) {
    throw new Error(result.stderr || `git diff failed with status ${result.status}`)
  }

  const hasChanges = result.status !== 0
  writeGithubOutput("CHANGES", hasChanges ? "true" : "false")
  process.stdout.write(hasChanges ? "Git changes detected.\n" : "No git changes detected.\n")
}

main()
