import { join } from "node:path"
import { $ } from "bun"
import { getDevDbContainerName } from "../shared/devDockerContainerName"
import { logErr, logOk, logSkip } from "./predevLog"

const label = "check_docker"
const containerName = getDevDbContainerName()
const repoRoot = process.cwd()

export async function checkDocker() {
  try {
    const inspect = await $`docker inspect -f {{.State.Running}} ${containerName}`.quiet().nothrow()
    const running = inspect.text().trim() === "true"

    if (running) {
      logSkip(label, "Container already running")
      return
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
