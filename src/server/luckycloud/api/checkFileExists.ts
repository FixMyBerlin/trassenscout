import { getDefaultRepoId, luckyCloudApiRequest } from "../_utils/client"

export async function checkFileExists(filePath: string) {
  const repoId = await getDefaultRepoId()

  const response = await luckyCloudApiRequest(
    "RepoFileDetail",
    { method: "GET" },
    { repoId },
    { p: filePath },
  )

  return response.ok
}
