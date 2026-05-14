import truncate from "@turf/truncate"
import type { Environment } from "../../utils/env"

interface ApiResponse {
  success?: boolean
  action?: string
  error?: string
  details?: Array<{ path?: string; message?: string }>
}

function truncateGeometryTo2D(geometry: unknown): unknown {
  if (!geometry || typeof geometry !== "object") {
    return geometry
  }

  try {
    return truncate(geometry as any, {
      coordinates: 2,
      mutate: false,
    })
  } catch {
    return geometry
  }
}

/**
 * Sends subsubsection data to the API endpoint
 * Returns success status and response data
 */
export async function sendToApi(
  apiEndpoint: string,
  apiKey: string,
  env: Environment,
  projectSlug: string,
  subsectionSlug: string,
  slug: string,
  userId: number,
  data: Record<string, any>,
) {
  try {
    const url = new URL(apiEndpoint)
    url.searchParams.set("apiKey", apiKey)
    const payloadData = {
      ...data,
      geometry: truncateGeometryTo2D(data.geometry),
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectSlug,
        subsectionSlug,
        slug,
        userId,
        data: payloadData,
      }),
    })

    const responseData = (await response.json()) as ApiResponse

    return {
      success: response.ok,
      response: responseData,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown network error"
    throw new Error(message)
  }
}
