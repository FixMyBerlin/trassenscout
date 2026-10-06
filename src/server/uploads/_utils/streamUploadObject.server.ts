import { isPlaywright } from "@/src/components/core/utils/isEnv"
import { getUploadServeHeaders } from "@/src/shared/uploads/serveHeaders"
import { getFilenameFromS3, getS3KeyFromUrl } from "@/src/shared/uploads/url"
import { getS3Object } from "./getS3Object.server"

const TEST_FIXTURE_JPEG_BASE64 =
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACv/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AfwD/2Q=="

type StreamOptions = {
  download?: boolean
  headers?: Record<string, string>
}

function serveTestFixtureImage(headers: Record<string, string>) {
  const body = Buffer.from(TEST_FIXTURE_JPEG_BASE64, "base64")
  return new Response(body, {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(body.byteLength),
      ...getUploadServeHeaders("image/jpeg"),
      ...headers,
    },
  })
}

/** Streams a stored upload from the private bucket; callers decide who may see it. */
export async function streamUploadObject(externalUrl: string, options: StreamOptions = {}) {
  const headers = { "Cache-Control": "no-cache", ...options.headers }

  if (isPlaywright) {
    return serveTestFixtureImage(headers)
  }

  const object = await getS3Object(getS3KeyFromUrl(externalUrl))

  return new Response(object.blob, {
    headers: {
      "Content-Type": object.contentType,
      "Content-Length": String(object.contentLength),
      ETag: object.eTag,
      ...getUploadServeHeaders(object.contentType, {
        forceDownload: options.download,
        filename: getFilenameFromS3(externalUrl),
      }),
      ...headers,
    },
  })
}
