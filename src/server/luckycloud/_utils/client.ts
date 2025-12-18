import { z } from "zod"
import { truncateErrorText } from "./errorTruncation"
import { getLuckyCloudLibraryName } from "./folders"

const LUCKY_CLOUD_DOMAIN = "https://sync.luckycloud.de"

// Different endpoints use different API base paths
const API_BASE_V2_1 = `${LUCKY_CLOUD_DOMAIN}/api/v2.1` as const
const API_BASE_API2 = `${LUCKY_CLOUD_DOMAIN}/api2` as const

// Endpoint definitions: full URL templates with placeholders like {repoId}
export const LuckyCloudEndpoints = {
  // "repos" are the top level folders which are called "Libraries" in the API Docs
  // Docs: https://storage.luckycloud.de/published/api-dokumentation/v2.1/libraries.md#user-content-List%20Libraries
  Repos: `${API_BASE_API2}/repos/`,
  // Docs: https://storage.luckycloud.de/published/api-dokumentation/v2.1/file-upload.md#user-content-Upload%20File
  RepoUploadLink: `${API_BASE_API2}/repos/{repoId}/upload-link/`,
  // Docs: https://storage.luckycloud.de/published/api-dokumentation/v2.1/file.md#user-content-List%20Items%20in%20Directory
  RepoFile: `${API_BASE_API2}/repos/{repoId}/file/`,
  // Docs: https://storage.luckycloud.de/published/api-dokumentation/v2.1/directories.md#user-content-Create%20New%20Directory
  RepoDir: `${API_BASE_API2}/repos/{repoId}/dir/`,
  // Docs: https://storage.luckycloud.de/published/api-dokumentation/v2.1/share-links.md
  ShareLinks: `${API_BASE_V2_1}/share-links/`,
  // Docs: https://storage.luckycloud.de/published/api-dokumentation/v2.1/share-links.md#user-content-Delete%20Share%20Link
  DeleteShareLink: `${API_BASE_V2_1}/share-links/{shareToken}/`,
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
  let urlString: string = LuckyCloudEndpoints[endpointKey]

  for (const [key, value] of Object.entries(replacements)) {
    urlString = urlString.replace(`{${key}}`, value)
  }

  const url = new URL(urlString)

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
    throw new Error("No libraries found. Please create a library in Luckycloud first.")
  }

  const expectedLibraryName = getLuckyCloudLibraryName()
  const matchingRepo = repos.find((repo) => repo.name === expectedLibraryName)

  if (!matchingRepo) {
    const availableLibraries = repos.map((r) => r.name || r.id).join(", ")
    throw new Error(
      `Library "${expectedLibraryName}" not found. Available libraries: ${availableLibraries}. ` +
        `Please ensure the library name matches the environment (${process.env.NEXT_PUBLIC_APP_ENV}).`,
    )
  }

  return matchingRepo.id
}
