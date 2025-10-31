type HandlerCtx<TParams = {}> = {
  apiKey: string
  params: TParams
  request: Request
}

/**
 * Wrapper function for API routes that require API key authentication.
 * The API key must be provided via query parameter: `apiKey`
 *
 * The function checks against `process.env.TS_API_KEY`
 */
export function withApiKey<TParams = {}>(handler: (ctx: HandlerCtx<TParams>) => Promise<Response>) {
  return async (request: Request, { params }: { params?: Promise<TParams> | TParams }) => {
    try {
      // Get API key from query param
      const url = new URL(request.url)
      const apiKey = url.searchParams.get("apiKey")

      // Validate API key
      const expectedApiKey = process.env.TS_API_KEY
      if (!expectedApiKey) {
        console.error("TS_API_KEY environment variable is not set on the server")
        return Response.json({ error: "API key not configured on server" }, { status: 500 })
      }

      if (!apiKey || apiKey !== expectedApiKey) {
        return Response.json({ statusText: "Unauthorized" }, { status: 401 })
      }

      // Resolve params if it's a Promise
      const resolvedParams = params instanceof Promise ? await params : params || ({} as TParams)

      return await handler({ apiKey, params: resolvedParams, request })
    } catch (error: any) {
      console.error("withApiKey error:", error)
      return Response.json({ error: "Internal server error" }, { status: 500 })
    }
  }
}
