import { z } from "zod"
import { buildEndpoint, getDefaultRepoId, luckyCloudApiRequest } from "../_utils/client"
import { truncateErrorText } from "../_utils/errorTruncation"
import { getLuckyCloudProjectPath } from "../_utils/folders"

const UploadLinkResponseSchema = z.string().url()

export async function uploadFileToLuckyCloud(
  fileBuffer: Buffer,
  filename: string,
  projectSlug: string,
) {
  const repoId = await getDefaultRepoId()
  const projectPath = getLuckyCloudProjectPath(projectSlug)

  const uploadLinkResponse = await luckyCloudApiRequest(
    "RepoUploadLink",
    { method: "GET" },
    { repoId },
    { p: "/" },
  )

  if (!uploadLinkResponse.ok) {
    const errorText = await uploadLinkResponse.text()
    const url = buildEndpoint("RepoUploadLink", { repoId }, { p: "/" })
    throw new Error(
      `Failed to get upload link: ${uploadLinkResponse.status} ${truncateErrorText(errorText)} (URL: ${url})`,
    )
  }

  const uploadLink = UploadLinkResponseSchema.parse(await uploadLinkResponse.json())

  // relative_path is relative to parent_dir (no leading slash)
  const relativePath = `${projectPath.substring(1)}/`

  const formData = new FormData()
  const blob = new Blob([new Uint8Array(fileBuffer)])
  formData.append("file", blob, filename)
  formData.append("parent_dir", "/")
  formData.append("relative_path", relativePath)

  const uploadResponse = await fetch(uploadLink, {
    method: "POST",
    body: formData,
  })

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text()
    throw new Error(
      `Failed to upload file: ${uploadResponse.status} ${truncateErrorText(errorText)} (Upload URL: ${uploadLink}, relative_path: ${relativePath})`,
    )
  }

  return `${projectPath}/${filename}` as const
}
