import { getObjectBlob, getObjectStream } from "@better-upload/server/helpers"
import { S3_BUCKET } from "@/src/shared/uploads/config"
import { getConfiguredS3Client } from "./s3Client.server"

const isResetConnection = (error: unknown) =>
  error instanceof Error && "code" in error && error.code === "ECONNRESET"

/** Bun reuses keep-alive sockets S3 already closed after ~20s idle; one retry gets a fresh one. */
async function withResetRetry<T>(request: () => Promise<T>) {
  try {
    return await request()
  } catch (error) {
    if (!isResetConnection(error)) throw error
    return request()
  }
}

export function getS3Object(key: string) {
  return withResetRetry(() => getObjectBlob(getConfiguredS3Client(), { bucket: S3_BUCKET, key }))
}

/** Passes the body through instead of buffering it; only the request itself is retried. */
export function getS3ObjectStream(key: string) {
  return withResetRetry(() => getObjectStream(getConfiguredS3Client(), { bucket: S3_BUCKET, key }))
}
