import { format } from "date-fns"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { enforcePublicEndpointRateLimit } from "@/src/server/auth/publicEndpointRateLimit.server"
import db from "@/src/server/db.server"
import { streamUploadObject } from "@/src/server/uploads/_utils/streamUploadObject.server"
import { NotFoundError } from "@/src/shared/auth/errors"
import {
  buildExternalShareGeojson,
  loadExternalShareContent,
} from "./_utils/externalShareContent.server"

// generateSecureToken: 32 bytes as base64url
const TOKEN_PATTERN = /^[\w-]{43}$/
const RATE_LIMIT = { max: 120, windowMs: 60_000 }
const PUBLIC_RESPONSE_HEADERS = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" }

const notFound = () => new Response("Not Found", { status: 404, headers: PUBLIC_RESPONSE_HEADERS })

/** Unknown, rotated and switched-off links all end here, indistinguishably. */
const sharedProjectWhere = (token: string) => ({
  externalShareToken: token,
  externalShareEnabled: true,
})

async function findSharedProject(token: string) {
  if (!TOKEN_PATTERN.test(token)) return null
  return db.project.findFirst({
    where: sharedProjectWhere(token),
    select: { id: true, slug: true, subTitle: true },
  })
}

export async function getPublicExternalShare(headers: Headers, token: string) {
  endpointAuth.public("the secret token is the credential, matched against an enabled project")
  enforcePublicEndpointRateLimit(headers, "externalShare", RATE_LIMIT)

  const project = await findSharedProject(token)
  if (!project) {
    throw new NotFoundError()
  }

  return {
    projectSlug: project.slug,
    projectSubTitle: project.subTitle,
    ...(await loadExternalShareContent(project.id)),
  }
}

export async function serveExternalShareUpload(
  headers: Headers,
  params: { token: string; uploadId: string },
  options: { download?: boolean } = {},
) {
  endpointAuth.public("the secret token is the credential, matched against an enabled project")
  enforcePublicEndpointRateLimit(headers, "externalShare", RATE_LIMIT)

  const uploadId = Number(params.uploadId)
  if (!TOKEN_PATTERN.test(params.token) || !Number.isInteger(uploadId) || uploadId <= 0) {
    return notFound()
  }

  const upload = await db.upload.findFirst({
    where: { id: uploadId, externalShareEnabled: true, project: sharedProjectWhere(params.token) },
    select: { externalUrl: true },
  })
  if (!upload) return notFound()

  return streamUploadObject(upload.externalUrl, {
    download: options.download,
    headers: PUBLIC_RESPONSE_HEADERS,
  })
}

export async function serveExternalShareGeojson(headers: Headers, params: { token: string }) {
  endpointAuth.public("the secret token is the credential, matched against an enabled project")
  enforcePublicEndpointRateLimit(headers, "externalShare", RATE_LIMIT)

  const project = await findSharedProject(params.token)
  if (!project) return notFound()

  const filename = `${project.slug}_Massnahmen_${format(new Date(), "yyyy-MM-dd")}.geojson`
  return new Response(JSON.stringify(await buildExternalShareGeojson(project.id)), {
    headers: {
      "Content-Type": "application/geo+json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      ...PUBLIC_RESPONSE_HEADERS,
    },
  })
}
