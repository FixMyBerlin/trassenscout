export const mcpToolOk = (data: unknown) => ({
  content: [
    {
      type: "text" as const,
      text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
    },
  ],
})

const mcpToolFail = (error: unknown) => ({
  content: [
    {
      type: "text" as const,
      text: `Error: ${error instanceof Error ? error.message : String(error)}`,
    },
  ],
  isError: true,
})

export async function runMcpTool(fn: () => Promise<unknown>) {
  try {
    return mcpToolOk(await fn())
  } catch (error) {
    return mcpToolFail(error)
  }
}
