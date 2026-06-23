import { join } from "node:path"
import { note } from "@clack/prompts"
import { $ } from "bun"
import { getDevDbContainerName } from "../shared/devDockerContainerName"
import { findContainerPublishingHostPort } from "./dockerHostPort"
import { logErr, logOk, logSkip } from "./predevLog"

const label = "check_docker"
const dbHostPort = 5432
const containerName = getDevDbContainerName()
const repoRoot = process.cwd()

function showPortConflictTip(blocker: string) {
  note(
    `Port ${dbHostPort} is already published by Docker container \`${blocker}\`.\n\nTrassenscout needs this port for \`${containerName}\` (Postgres).\n\nFree it up, then run \`bun run dev\` again:\n\n  docker stop ${blocker}`,
    "Port 5432 in use",
  )
}

export async function checkDocker() {
  try {
    const inspect = await $`docker inspect -f {{.State.Running}} ${containerName}`.quiet().nothrow()
    const running = inspect.text().trim() === "true"

    if (running) {
      logSkip(label, "Container already running")
      return
    }

    const portBlocker = await findContainerPublishingHostPort(dbHostPort)
    if (portBlocker && portBlocker !== containerName) {
      showPortConflictTip(portBlocker)
      logErr(label, `Port ${dbHostPort} is taken by Docker container "${portBlocker}"`)
      process.exit(1)
    }

    const proc = Bun.spawn(
      [
        "docker",
        "compose",
        "-f",
        join(repoRoot, "docker-compose.yml"),
        "-f",
        join(repoRoot, "docker-compose.override.yml"),
        "up",
        "db",
        "imap-listener",
        "-d",
      ],
      {
        cwd: repoRoot,
        stdout: "inherit",
        stderr: "inherit",
      },
    )
    const exitCode = await proc.exited
    if (exitCode !== 0) {
      throw new Error(`exit code ${exitCode}`)
    }
    logOk(label)
  } catch (error) {
    logErr(label, error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

if (import.meta.main) {
  await checkDocker()
}
