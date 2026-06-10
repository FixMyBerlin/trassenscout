import { getTestEnv, prepareTestDb } from "./docker"

async function runCommand(args: string[]) {
  const proc = Bun.spawn(["bun", ...args], {
    cwd: process.cwd(),
    env: await getTestEnv(),
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  })
  return proc.exited
}

export async function main() {
  const args = Bun.argv.slice(2)
  if (args.length === 0) {
    console.error("Usage: bun scripts/test/withTestDb.ts <command> [args...]")
    return 1
  }

  try {
    await prepareTestDb()

    const exitCode = await runCommand(args)
    return exitCode === 0 ? 0 : exitCode
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    return 1
  }
}

if (import.meta.main) {
  process.exit(await main())
}
