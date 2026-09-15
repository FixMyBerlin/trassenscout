import { describe, expect, test } from "vitest"
import {
  getMcpDraftRetentionCutoffDate,
  MCP_DRAFT_RETENTION_DAYS,
} from "@/src/server/mcp/mcpDraftRetention.const"

describe("MCP draft retention", () => {
  test("cutoff is 14 days before now", () => {
    const now = new Date("2026-09-16T12:00:00.000Z")
    expect(MCP_DRAFT_RETENTION_DAYS).toBe(14)
    expect(getMcpDraftRetentionCutoffDate(now).toISOString()).toBe("2026-09-02T12:00:00.000Z")
  })
})
