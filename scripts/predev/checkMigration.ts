import { confirm, isCancel, note } from "@clack/prompts"
import { $ } from "bun"
import { logErr, logOk } from "./predevLog"

const label = "check_migration"
const pendingMigrationsBanner = "Following migrations have not yet been applied"
const pendingMigrationsError = "Pending database migrations."

const pendingMigrationsTipBody = `Run:

  bun run migrate

Then start the dev server again.`

function showPendingMigrationsTip() {
  note(pendingMigrationsTipBody, "Tip")
}

export async function checkMigration() {
  try {
    const result = await $`bun run migrate-check`.quiet().nothrow()
    const output = result.text()

    if (!output.includes(pendingMigrationsBanner)) {
      if (result.exitCode === 0) {
        logOk(label)
        return
      }
      throw new Error(output.trim() || `migrate-check failed with exit code ${result.exitCode}`)
    }

    console.error("There are pending migrations.")

    if (Bun.argv.includes("--non-interactive")) {
      showPendingMigrationsTip()
      throw new Error(pendingMigrationsError)
    }

    const apply = await confirm({
      message: "Apply them now?",
    })
    if (isCancel(apply)) {
      throw new Error("Cancelled")
    }
    if (!apply) {
      showPendingMigrationsTip()
      throw new Error(pendingMigrationsError)
    }

    const migrateProc = Bun.spawn(["bun", "run", "migrate"], {
      cwd: process.cwd(),
      stdout: "inherit",
      stderr: "inherit",
      stdin: "inherit",
    })
    const migrateExit = await migrateProc.exited
    if (migrateExit !== 0) {
      throw new Error(`migrate failed with exit code ${migrateExit}`)
    }
    logOk(label)
  } catch (error) {
    logErr(label, error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

if (import.meta.main) {
  await checkMigration()
}
