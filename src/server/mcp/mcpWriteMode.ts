export type McpWriteMode = "drafted" | "applied"

export function mcpWriteFields(mode: McpWriteMode | null) {
  return {
    drafted: mode === "drafted",
    mode,
  }
}

/** Runs exactly one of the two handlers based on the effective mode and reports which. */
export async function writeResolvedItem(
  resolved: { mcpMode: string },
  handlers: { draft: () => Promise<unknown>; apply: () => Promise<unknown> },
): Promise<McpWriteMode> {
  if (resolved.mcpMode === "DIRECT") {
    await handlers.apply()
    return "applied"
  }
  await handlers.draft()
  return "drafted"
}
