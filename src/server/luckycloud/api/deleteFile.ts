import { buildEndpoint, getDefaultRepoId, luckyCloudApiRequest } from "../_utils/client"
import { truncateErrorText } from "../_utils/errorTruncation"

export async function deleteFileFromLuckyCloud(filePath: string) {
  const repoId = await getDefaultRepoId()

  const response = await luckyCloudApiRequest(
    "RepoFile",
    { method: "DELETE" },
    { repoId },
    { p: filePath },
  )

  if (!response.ok) {
    if (response.status === 404) {
      return
    }
    const errorText = await response.text()
    const url = buildEndpoint("RepoFile", { repoId }, { p: filePath })
    throw new Error(
      `Failed to delete file from Luckycloud: ${response.status} ${truncateErrorText(errorText)} (URL: ${url})`,
    )
  }
}
