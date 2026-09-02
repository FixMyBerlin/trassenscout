import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { createFileRoute } from "@tanstack/react-router"
import { guardAdminApi } from "@/src/server/api/admin/guardAdminApi.server"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { buildMcpServer } from "@/src/server/mcp/buildMcpServer"

async function handleMcpPost(request: Request): Promise<Response> {
  const guard = await guardAdminApi(request)
  if (!guard.access) return guard.response

  const server = buildMcpServer({ auth: guard.auth, request })
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  })

  await server.connect(transport)
  return transport.handleRequest(request)
}

function methodNotAllowed() {
  return new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    }),
    {
      status: 405,
      headers: {
        Allow: "POST",
        "Content-Type": "application/json",
      },
    },
  )
}

export const Route = createFileRoute("/mcp")({
  ssr: false,
  server: {
    handlers: {
      POST: ({ request }) => {
        endpointAuth.inherited("Admin API Bearer token auth via guardAdminApi")
        return handleMcpPost(request)
      },
      GET: () => {
        endpointAuth.public("MCP Streamable HTTP: GET not supported in stateless JSON mode")
        return methodNotAllowed()
      },
      DELETE: () => {
        endpointAuth.public("MCP Streamable HTTP: DELETE not supported in stateless JSON mode")
        return methodNotAllowed()
      },
    },
  },
})
