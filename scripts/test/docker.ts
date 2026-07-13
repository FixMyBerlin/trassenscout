import { join } from "node:path"
import { $ } from "bun"
import { getDevDbContainerName } from "../shared/devDockerContainerName"
import { loadE2eEnv } from "../shared/e2eEnv"

const containerName = getDevDbContainerName()
const repoRoot = process.cwd()

export async function getTestEnv() {
  return loadE2eEnv()
}

async function runBunWithTestEnv(args: string[]) {
  const command = ["bun", ...args]
  const proc = Bun.spawn(command, {
    cwd: repoRoot,
    env: await getTestEnv(),
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  })
  const exitCode = await proc.exited
  if (exitCode !== 0) {
    throw new Error(`${command.join(" ")} failed with exit code ${exitCode}`)
  }
}

async function isContainerRunning(): Promise<boolean> {
  const result = await $`docker inspect -f {{.State.Running}} ${containerName}`.quiet().nothrow()
  return result.exitCode === 0 && result.text().trim() === "true"
}

async function waitForPostgres() {
  for (let attempt = 0; attempt < 30; attempt++) {
    const ready = await $`docker exec ${containerName} pg_isready -U postgres`.quiet().nothrow()
    if (ready.exitCode === 0) return
    await Bun.sleep(1000)
  }

  throw new Error(`${containerName} did not become ready in time`)
}

async function startComposeDb() {
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
    throw new Error(`docker compose up db failed with exit code ${exitCode}`)
  }
}

/** Reuses the local dev Postgres container (`ts-db` or prefixed) — same pattern as TILDA compose db. */
export async function ensureTestDbRunning() {
  if (await isContainerRunning()) {
    console.log(`Docker: Reusing running ${containerName}`)
    return
  }

  await startComposeDb()
  await waitForPostgres()
}

export async function startTestDb() {
  await ensureTestDbRunning()
}

export async function prepareTestDb() {
  await ensureTestDbRunning()
  await runBunWithTestEnv(["prisma", "migrate", "deploy"])
}

export async function resetAndSeedTestDb() {
  await runBunWithTestEnv(["prisma", "migrate", "reset", "--force"])
  await runBunWithTestEnv(["prisma", "db", "seed"])
}

async function main() {
  const command = Bun.argv[2]
  if (command === "start") {
    await prepareTestDb()
    return
  }
  if (command === "ensure") {
    await ensureTestDbRunning()
    return
  }
  console.error("Usage: bun scripts/test/docker.ts <start|ensure>")
  process.exit(1)
}

if (import.meta.main) {
  try {
    await main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  }
}
