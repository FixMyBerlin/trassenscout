import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, test } from "vitest"

const mcpRoot = join(import.meta.dirname, "..")
const forbidden =
  /db\.(subsection|subsubsection)\.(create|createMany|update|updateMany|delete|deleteMany|upsert)\(/

function tsFilesUnder(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return tsFilesUnder(full)
    return entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts") ? [full] : []
  })
}

describe("MCP direct write boundary", () => {
  test("only src/server/mcp/direct writes live Subsection or Subsubsection rows", () => {
    const offenders = tsFilesUnder(mcpRoot)
      .filter((file) => !file.includes(`${join("mcp", "direct")}/`))
      .filter((file) => forbidden.test(readFileSync(file, "utf8")))
    expect(offenders).toEqual([])
  })
})
