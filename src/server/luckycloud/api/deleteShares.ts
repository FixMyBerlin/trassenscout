import { z } from "zod"
import { getDefaultRepoId, luckyCloudApiRequest } from "../_utils/client"
import { truncateErrorText } from "../_utils/errorTruncation"

const ShareItemSchema = z.object({
  token: z.string(),
  link: z.string(),
  path: z.string(),
  repo_id: z.string(),
})

const SharesListResponseSchema = z.array(ShareItemSchema)

export async function deleteShares(filePath: string) {
  const repoId = await getDefaultRepoId()

  const listResponse = await luckyCloudApiRequest(
    "ShareLinks",
    { method: "GET" },
    {},
    { repo_id: repoId, path: filePath },
  )

  if (!listResponse.ok) {
    if (listResponse.status === 404) {
      return
    }
    const errorText = await listResponse.text()
    throw new Error(`Failed to list shares: ${listResponse.status} ${truncateErrorText(errorText)}`)
  }

  const shares = SharesListResponseSchema.parse(await listResponse.json())

  for (const share of shares) {
    const deleteResponse = await luckyCloudApiRequest(
      "DeleteShareLink",
      { method: "DELETE" },
      { shareToken: share.token },
    )

    if (!deleteResponse.ok && deleteResponse.status !== 404) {
      console.warn(`Failed to delete share ${share.token}: ${deleteResponse.status}`)
    }
  }
}
