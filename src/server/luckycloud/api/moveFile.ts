import { buildEndpoint, getDefaultRepoId, luckyCloudApiRequest } from "../_utils/client"
import { truncateErrorText } from "../_utils/errorTruncation"
import { ensureDirectoryExists } from "./ensureDirectoryExists"

export async function moveFile(sourcePath: string, destPath: string) {
  const repoId = await getDefaultRepoId()

  // Extract destination directory from path (e.g., /projectSlug/_ARCHIVE/filename -> /projectSlug/_ARCHIVE)
  const destDir = destPath.substring(0, destPath.lastIndexOf("/")) || "/"
  if (!destDir.startsWith("/")) {
    throw new Error(`Invalid destination directory: ${destDir} (must start with /)`)
  }

  const projectSlug = destDir.split("/").filter(Boolean)[0]
  if (!projectSlug) {
    throw new Error(`Invalid destination directory: ${destDir} (could not extract projectSlug)`)
  }

  await ensureDirectoryExists(projectSlug)

  const formBody = new URLSearchParams({
    operation: "move",
    dst_repo: repoId,
    dst_dir: destDir,
  }).toString()
  const response = await luckyCloudApiRequest(
    "RepoFile",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
      redirect: "follow", // Explicitly follow redirects
    },
    { repoId },
    { p: sourcePath },
  )

  if (!response.ok) {
    const errorText = await response.text()
    const url = buildEndpoint("RepoFile", { repoId }, { p: sourcePath })
    throw new Error(
      `Failed to move file: ${response.status} ${truncateErrorText(errorText)} (URL: ${url}, dest_dir: ${destDir}, body: ${formBody})`,
    )
  }

  // API returns a JSON string containing a URL when move succeeds
  const responseText = await response.text()
  const responseData = JSON.parse(responseText)

  if (typeof responseData !== "string") {
    throw new Error(`Unexpected response format: expected string, got ${typeof responseData}`)
  }
}
