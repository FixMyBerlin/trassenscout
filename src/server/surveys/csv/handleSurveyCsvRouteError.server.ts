import { ZodError } from "zod"
import { AuthorizationError, NotFoundError } from "@/src/shared/auth/errors"

export function handleSurveyCsvRouteError(error: unknown) {
  if (error instanceof AuthorizationError) {
    return new Response("Unauthorized", { status: 401 })
  }

  if (error instanceof NotFoundError) {
    return new Response("Not Found", { status: 404 })
  }

  if (error instanceof ZodError || (error as { code?: string }).code === "P2025") {
    return new Response("Not Found", { status: 404 })
  }

  console.error("Survey CSV export error:", error)
  return new Response("Internal Server Error", { status: 500 })
}
