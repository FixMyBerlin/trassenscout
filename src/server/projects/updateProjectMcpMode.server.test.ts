import { beforeEach, describe, expect, test, vi } from "vitest"
import { MCP_DIRECT_WINDOW_MS } from "@/src/server/mcp/effectiveMcpMode"

const mockAdmin = vi.fn()
const mockUpdate = vi.fn()

vi.mock("@/src/server/auth/endpointAuth.server", () => ({
  endpointAuth: { admin: (...args: unknown[]) => mockAdmin(...args) },
}))

vi.mock("@/src/server/db.server", () => ({
  default: { project: { update: (...args: unknown[]) => mockUpdate(...args) } },
}))

describe("updateProjectMcpMode", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAdmin.mockResolvedValue({ userId: 1, role: "ADMIN" })
  })

  test("direct sets a 24 hour window", async () => {
    const { updateProjectMcpMode } = await import("./projects.server")
    mockUpdate.mockImplementation(
      async ({ data }: { data: { mcpMode: string; mcpDirectUntil: Date | null } }) => ({
        slug: "frm9-ra3",
        mcpMode: data.mcpMode,
        mcpDirectUntil: data.mcpDirectUntil,
      }),
    )

    const before = Date.now()
    const result = await updateProjectMcpMode(new Headers(), {
      projectSlug: "frm9-ra3",
      mcpMode: "DIRECT",
    })

    expect(result.effectiveMcpMode).toBe("DIRECT")
    const until = new Date(result.mcpDirectUntil!).getTime()
    expect(until - before).toBeGreaterThanOrEqual(MCP_DIRECT_WINDOW_MS)
    expect(until - before).toBeLessThan(MCP_DIRECT_WINDOW_MS + 5_000)
  })

  test("draft and disabled clear the window", async () => {
    const { updateProjectMcpMode } = await import("./projects.server")
    mockUpdate.mockImplementation(
      async ({ data }: { data: { mcpMode: string; mcpDirectUntil: Date | null } }) => ({
        slug: "frm9-ra3",
        mcpMode: data.mcpMode,
        mcpDirectUntil: data.mcpDirectUntil,
      }),
    )

    const drafted = await updateProjectMcpMode(new Headers(), {
      projectSlug: "frm9-ra3",
      mcpMode: "DRAFT",
    })
    expect(drafted.mcpDirectUntil).toBeNull()
    expect(drafted.effectiveMcpMode).toBe("DRAFT")

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { mcpMode: "DRAFT", mcpDirectUntil: null } }),
    )
  })

  test("rejects a non-admin", async () => {
    const { updateProjectMcpMode } = await import("./projects.server")
    mockAdmin.mockRejectedValue(new Error("not admin"))

    await expect(
      updateProjectMcpMode(new Headers(), { projectSlug: "frm9-ra3", mcpMode: "DIRECT" }),
    ).rejects.toThrow("not admin")
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})
