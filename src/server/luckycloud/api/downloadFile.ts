import { z } from "zod"
import { getDefaultRepoId, luckyCloudApiRequest } from "../_utils/client"
import { truncateErrorText } from "../_utils/errorTruncation"

// API returns a download URL, not the file content directly
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
    throw new Error(
      `Failed to get download URL: ${response.status} ${truncateErrorText(errorText)}`,
    )
  }

  const downloadUrl = FileDownloadUrlSchema.parse(await response.json())
  const fileResponse = await fetch(downloadUrl)

  if (!fileResponse.ok) {
    const errorText = await fileResponse.text()
    throw new Error(
      `Failed to download file: ${fileResponse.status} ${truncateErrorText(errorText)}`,
    )
  }

  return Buffer.from(await fileResponse.arrayBuffer())
}
