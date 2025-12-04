import { getDefaultRepoId, luckyCloudApiRequest } from "../_utils/client"

// Tracking may not be available via API, so we log warnings but don't fail
export async function enableTracking(filePath: string) {
  const repoId = await getDefaultRepoId()

  const response = await luckyCloudApiRequest(
    "RepoFileDetail",
    {
      method: "PUT",
      body: JSON.stringify({ enable_tracking: true }),
    },
    { repoId },
    { p: filePath },
  )

  if (!response.ok) {
    console.warn(`Failed to enable tracking for ${filePath}: ${response.status}`)
  }
}
