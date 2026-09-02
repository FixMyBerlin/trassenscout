import { ADMIN_API_TOKEN_PREFIX } from "@/src/server/admin/adminApiTokenPrefix.const"
import type { EnvVite } from "@/src/server/envSchema"

export type McpEnvLabel = "DEV" | "STG" | "PRD"

export function mcpEnvLabel(viteAppEnv: EnvVite["VITE_APP_ENV"] | undefined): McpEnvLabel {
  if (viteAppEnv === "production") return "PRD"
  if (viteAppEnv === "staging") return "STG"
  return "DEV"
}

const MCP_TOKEN_PLACEHOLDER = `${ADMIN_API_TOKEN_PREFIX}REPLACE_WITH_YOUR_ADMIN_API_TOKEN`

export function buildMcpCursorConfigJson({
  envLabel,
  origin,
  apiToken = MCP_TOKEN_PLACEHOLDER,
}: {
  envLabel: McpEnvLabel
  origin: string
  apiToken?: string
}) {
  return JSON.stringify(
    {
      mcpServers: {
        [`trassenscout-admin--${envLabel}`]: {
          url: new URL("/mcp", origin).href,
          headers: {
            Authorization: `Bearer ${apiToken}`,
          },
        },
      },
    },
    null,
    2,
  )
}
