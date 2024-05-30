export const checkApiKey = (request: Request | Record<string, any>) => {
  if (process.env.NODE_ENV === "development") {
    return { ok: true, errorResponse: null }
  }

  const apiKey = new URL(request.url).searchParams.get("apiKey")

  if (apiKey === process.env.TS_API_KEY) {
    return { ok: true, errorResponse: null }
  } else {
    return {
      ok: false,
      errorResponse: Response.json({ statusText: "Unauthorized" }, { status: 401 }),
    }
  }
}
