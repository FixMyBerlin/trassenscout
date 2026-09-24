import { describe, expect, test } from "vitest"
import { McpModeEnum } from "@/src/prisma/generated/client"
import { MCP_DIRECT_WINDOW_MS, effectiveMcpMode, mcpDirectUntilFromNow } from "./effectiveMcpMode"

const now = new Date("2026-09-24T15:00:00.000Z")

describe("effectiveMcpMode", () => {
  test("disabled and draft stay as stored", () => {
    expect(effectiveMcpMode({ mcpMode: McpModeEnum.DISABLED, mcpDirectUntil: null }, now)).toBe(
      "DISABLED",
    )
    expect(
      effectiveMcpMode(
        { mcpMode: McpModeEnum.DRAFT, mcpDirectUntil: new Date("2026-09-25T15:00:00.000Z") },
        now,
      ),
    ).toBe("DRAFT")
  })

  test("direct is effective only before mcpDirectUntil", () => {
    expect(
      effectiveMcpMode(
        { mcpMode: McpModeEnum.DIRECT, mcpDirectUntil: new Date("2026-09-24T15:00:00.001Z") },
        now,
      ),
    ).toBe("DIRECT")
    expect(
      effectiveMcpMode(
        { mcpMode: McpModeEnum.DIRECT, mcpDirectUntil: new Date("2026-09-24T15:00:00.000Z") },
        now,
      ),
    ).toBe("DRAFT")
    expect(
      effectiveMcpMode(
        { mcpMode: McpModeEnum.DIRECT, mcpDirectUntil: new Date("2026-09-24T14:00:00.000Z") },
        now,
      ),
    ).toBe("DRAFT")
    expect(effectiveMcpMode({ mcpMode: McpModeEnum.DIRECT, mcpDirectUntil: null }, now)).toBe(
      "DRAFT",
    )
  })

  test("turning direct on sets a fresh 24 hour window", () => {
    expect(mcpDirectUntilFromNow(now).getTime() - now.getTime()).toBe(MCP_DIRECT_WINDOW_MS)
  })
})
