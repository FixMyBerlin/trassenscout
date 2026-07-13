#!/usr/bin/env bun

import { writeGithubEnv } from "./shared/github-actions.ts"
import { parseArgs } from "./shared/parse-args.ts"

type WorkflowRunsResponse = {
  workflow_runs?: Array<{ conclusion?: string | null; head_sha?: string }>
}

function buildWorkflowRunsUrl(repository: string, workflowFile: string, branch: string) {
  const workflowId = encodeURIComponent(workflowFile)
  const params = new URLSearchParams({
    branch,
    status: "success",
    per_page: "1",
  })
  return `https://api.github.com/repos/${repository}/actions/workflows/${workflowId}/runs?${params}`
}

async function main() {
  const args = parseArgs(process.argv)
  const repository = args.get("repository") ?? process.env.GITHUB_REPOSITORY
  const branch = args.get("branch")
  const workflowFile = args.get("workflow-file")
  const token = process.env.GITHUB_TOKEN

  if (!repository)
    throw new Error("Missing repository (pass --repository or set GITHUB_REPOSITORY)")
  if (!branch) throw new Error("Missing --branch")
  if (!workflowFile) throw new Error("Missing --workflow-file")
  if (!token) throw new Error("GITHUB_TOKEN is not set")

  const response = await fetch(buildWorkflowRunsUrl(repository, workflowFile, branch), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  })

  if (!response.ok) {
    throw new Error(`GitHub API request failed (${response.status} ${response.statusText})`)
  }

  const data = (await response.json()) as WorkflowRunsResponse
  const lastRunSha = data.workflow_runs?.[0]?.head_sha ?? ""

  writeGithubEnv("LAST_RUN_SHA", lastRunSha)
  process.stdout.write(
    `Last successful deploy SHA for ${workflowFile} on ${branch}: ${lastRunSha || "(none)"}\n`,
  )
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exit(1)
})
