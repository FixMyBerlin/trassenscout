import { z } from "zod"
import { truncateErrorText } from "./errorTruncation"

const LUCKY_CLOUD_DOMAIN = "https://sync.luckycloud.de"

// Lucky Cloud uses different API base paths for different endpoints
// Some use /api2/, others use /api/v2.1/
const API_BASE_V2_1 = `${LUCKY_CLOUD_DOMAIN}/api/v2.1/`
const API_BASE_API2 = `${LUCKY_CLOUD_DOMAIN}/api2/`

// Endpoint definitions: [path_template, api_base_path]
// Paths should not start with / so they append to the base URL correctly
export const LuckyCloudEndpoints = {
  Repos: ["repos/", API_BASE_API2],
  RepoUploadLink: ["repos/{repoId}/upload-link/", API_BASE_API2],
  RepoDir: ["repos/{repoId}/dir/", API_BASE_API2],
  RepoFile: ["repos/{repoId}/file/", API_BASE_API2],
  RepoFileDetail: ["repos/{repoId}/file/detail/", API_BASE_API2],
  ShareLinks: ["share-links/", API_BASE_V2_1],
  ShareLinkDetail: ["share-links/{shareToken}/", API_BASE_V2_1],
  BatchMoveItem: ["repos/sync-batch-move-item/", API_BASE_V2_1],
} as const

export type LuckyCloudEndpoint = keyof typeof LuckyCloudEndpoints

function getAuthToken() {
  const token = process.env.LUCKY_CLOUD_TOKEN
  if (!token) {
    throw new Error("LUCKY_CLOUD_TOKEN is not configured")
  }
  return token
}

export function buildEndpoint(
  endpointKey: LuckyCloudEndpoint,
  replacements: Record<string, string>,
  queryParams?: Record<string, string>,
): string {
  const [template, apiBase] = LuckyCloudEndpoints[endpointKey]
  let endpoint: string = template
  for (const [key, value] of Object.entries(replacements)) {
    endpoint = endpoint.replace(`{${key}}`, value)
  }

  const url = new URL(endpoint, apiBase)

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      url.searchParams.append(key, value)
    }
  }

  return url.toString()
}

export async function luckyCloudApiRequest(
  endpointKey: LuckyCloudEndpoint,
  options: RequestInit = {},
  replacements: Record<string, string> = {},
  queryParams?: Record<string, string>,
) {
  const token = getAuthToken()
  const url = buildEndpoint(endpointKey, replacements, queryParams)

  const headers = new Headers(options.headers)
  headers.set("Authorization", `Token ${token}`)
  headers.set("Accept", "application/json; charset=utf-8; indent=4")

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  return fetch(url, { ...options, headers })
}

const RepoSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  type: z.string().optional(),
})

const RepoListResponseSchema = z.array(RepoSchema)

export async function getDefaultRepoId() {
  const token = process.env.LUCKY_CLOUD_TOKEN
  if (!token) {
    throw new Error("LUCKY_CLOUD_TOKEN is not configured. Please set it in your .env file.")
  }

  const reposResponse = await luckyCloudApiRequest("Repos", { method: "GET" })

  if (!reposResponse.ok) {
    const errorText = await reposResponse.text()
    const truncatedError = truncateErrorText(errorText)

    if (reposResponse.status === 404) {
      const url = buildEndpoint("Repos", {})
      throw new Error(
        `Failed to list repos (404): The endpoint ${url} was not found. ` +
          `This might indicate an authentication issue or incorrect API endpoint. ` +
          `Error: ${truncatedError}`,
      )
    }

    throw new Error(`Failed to list repos: ${reposResponse.status} ${truncatedError}`)
  }

  const jsonData = await reposResponse.json()
  const repos = RepoListResponseSchema.parse(jsonData)

  if (repos.length === 0) {
    throw new Error("No repositories found. Please create a repository in Lucky Cloud first.")
  }

  const firstRepo = repos[0]
  if (!firstRepo) {
    throw new Error("No repositories found. Please create a repository in Lucky Cloud first.")
  }

  return firstRepo.id
}
