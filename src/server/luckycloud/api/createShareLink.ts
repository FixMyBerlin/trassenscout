import { z } from "zod"
import { getDefaultRepoId, luckyCloudApiRequest } from "../_utils/client"
import { truncateErrorText } from "../_utils/errorTruncation"

const ShareLinkResponseSchema = z.object({
  token: z.string(),
  link: z.string(),
  path: z.string(),
  repo_id: z.string(),
  permissions: z.object({
    can_edit: z.boolean(),
    can_download: z.boolean(),
  }),
})

export interface ShareLinkResult {
  shareLink: string
  filePath: string
  shareToken: string
}

export async function createShareLink(filePath: string) {
  const repoId = await getDefaultRepoId()

  const response = await luckyCloudApiRequest("ShareLinks", {
    method: "POST",
    body: JSON.stringify({
      repo_id: repoId,
      path: filePath,
      permissions: {
        can_edit: true,
        can_download: true,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `Failed to create share link: ${response.status} ${truncateErrorText(errorText)}`,
    )
  }

  const data = ShareLinkResponseSchema.parse(await response.json())

  return {
    shareLink: data.link,
    filePath: data.path,
    shareToken: data.token,
  }
}
