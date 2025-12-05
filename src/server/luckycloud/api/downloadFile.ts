import { z } from "zod"
import { buildEndpoint, getDefaultRepoId, luckyCloudApiRequest } from "../_utils/client"
import { truncateErrorText } from "../_utils/errorTruncation"

const FileDownloadUrlSchema = z.string().url()

export async function downloadFileFromLuckyCloud(filePath: string) {
  const repoId = await getDefaultRepoId()

  const response = await luckyCloudApiRequest(
    "RepoFile",
    { method: "GET" },
    { repoId },
    { p: filePath },
  )

  if (!response.ok) {
    const errorText = await response.text()
    const url = buildEndpoint("RepoFile", { repoId }, { p: filePath })
    throw new Error(
      `Failed to get download URL: ${response.status} ${truncateErrorText(errorText)} (URL: ${url})`,
    )
  }

  const downloadUrl = FileDownloadUrlSchema.parse(await response.json())

  // API returns a redirect URL that points to the actual file
  const fileResponse = await fetch(downloadUrl, {
    redirect: "follow",
  })

  if (!fileResponse.ok) {
    const errorText = await fileResponse.text()
    throw new Error(
      `Failed to download file: ${fileResponse.status} ${truncateErrorText(errorText)} (Download URL: ${downloadUrl})`,
    )
  }

  const arrayBuffer = await fileResponse.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
