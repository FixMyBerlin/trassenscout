export const MCP_LIST_DEFAULT_LIMIT = 20
export const MCP_LIST_MAX_LIMIT = 50

export function resolveMcpListLimit(limit: number | undefined) {
  if (limit == null) return MCP_LIST_DEFAULT_LIMIT
  return Math.min(Math.max(1, Math.floor(limit)), MCP_LIST_MAX_LIMIT)
}

export function mcpListResult<T>(items: T[], limit: number) {
  const truncated = items.length > limit
  const slice = truncated ? items.slice(0, limit) : items
  return {
    limit,
    returned: slice.length,
    truncated,
    items: slice,
  }
}
