import { z } from "zod"
import { getDefaultRepoId, luckyCloudApiRequest } from "../_utils/client"
import { truncateErrorText } from "../_utils/errorTruncation"
import { getLuckyCloudFolder } from "../_utils/folders"

// Upload link API returns a plain string URL, not an object
const UploadLinkResponseSchema = z.string().url()

export async function uploadFileToLuckyCloud(
  fileBuffer: Buffer,
  filename: string,
  folderPath?: string,
) {
  const repoId = await getDefaultRepoId()
  const folder = folderPath || getLuckyCloudFolder()

  const uploadLinkResponse = await luckyCloudApiRequest(
    "RepoUploadLink",
    { method: "GET" },
    { repoId },
    { p: "/" },
  )

  if (!uploadLinkResponse.ok) {
    const errorText = await uploadLinkResponse.text()
    throw new Error(
      `Failed to get upload link: ${uploadLinkResponse.status} ${truncateErrorText(errorText)}`,
    )
  }

  const uploadLink = UploadLinkResponseSchema.parse(await uploadLinkResponse.json())

  // Use relative_path to create folder structure recursively if it doesn't exist
  const formData = new FormData()
  const blob = new Blob([new Uint8Array(fileBuffer)])
  formData.append("file", blob, filename)
  formData.append("parent_dir", "/")
  formData.append("relative_path", `${folder}/`)

  const uploadResponse = await fetch(uploadLink, {
    method: "POST",
    body: formData,
  })

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text()
    throw new Error(
      `Failed to upload file: ${uploadResponse.status} ${truncateErrorText(errorText)}`,
    )
  }

  return `/${folder}/${filename}`
}
