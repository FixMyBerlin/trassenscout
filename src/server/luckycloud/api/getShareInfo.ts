import { z } from "zod"
import { luckyCloudApiRequest } from "../_utils/client"

const ShareInfoResponseSchema = z.object({
  path: z.string(),
  repo_id: z.string(),
})

export async function getFilePathFromShare(shareToken: string) {
  try {
    const response = await luckyCloudApiRequest(
      "ShareLinkDetail",
      { method: "GET" },
      { shareToken },
    )

    if (!response.ok) {
      return null
    }

    const data = ShareInfoResponseSchema.parse(await response.json())
    return data.path || null
  } catch (error) {
    console.warn("Failed to get file path from share:", error)
    return null
  }
}
