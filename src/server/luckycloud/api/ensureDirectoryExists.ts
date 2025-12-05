import { z } from "zod"
import { buildEndpoint, getDefaultRepoId, luckyCloudApiRequest } from "../_utils/client"
import { truncateErrorText } from "../_utils/errorTruncation"
import {
  getLuckyCloudArchivePath,
  getLuckyCloudProjectPath,
  LUCKY_CLOUD_ARCHIVE_FOLDER_NAME,
} from "../_utils/folders"

const DirItemSchema = z.object({
  type: z.string(),
  name: z.string(),
})

// API returns an array directly, not an object with dirent_list
const DirListResponseSchema = z.array(DirItemSchema)

/**
 * Ensures the _ARCHIVE directory exists for a project. Idempotent.
 */
export async function ensureDirectoryExists(projectSlug: string) {
  const repoId = await getDefaultRepoId()

  const archivePath = getLuckyCloudArchivePath(projectSlug)
  const projectPath = getLuckyCloudProjectPath(projectSlug)
  const parentDir = projectPath
  const dirName = LUCKY_CLOUD_ARCHIVE_FOLDER_NAME

  const checkResponse = await luckyCloudApiRequest(
    "RepoDir",
    { method: "GET" },
    { repoId },
    { p: parentDir },
  )

  if (checkResponse.ok) {
    const direntList = DirListResponseSchema.parse(await checkResponse.json())
    const dirExists = direntList.some((item) => item.type === "dir" && item.name === dirName)
    if (dirExists) {
      return
    }
  } else {
    const errorText = await checkResponse.text()
    const url = buildEndpoint("RepoDir", { repoId }, { p: parentDir })
    throw new Error(
      `Failed to check parent directory: ${checkResponse.status} ${truncateErrorText(errorText)} (URL: ${url})`,
    )
  }

  const createResponse = await luckyCloudApiRequest(
    "RepoDir",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "operation=mkdir",
    },
    { repoId },
    { p: archivePath },
  )

  if (!createResponse.ok) {
    const errorText = await createResponse.text()
    const url = buildEndpoint("RepoDir", { repoId }, { p: archivePath })
    throw new Error(
      `Failed to create directory: ${createResponse.status} ${truncateErrorText(errorText)} (URL: ${url})`,
    )
  }
}
