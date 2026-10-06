import { getObject } from "@better-upload/server/helpers"
import { S3_BUCKET } from "@/src/shared/uploads/config"
import { getConfiguredS3Client } from "./s3Client.server"

const isResetConnection = (error: unknown) =>
  error instanceof Error && "code" in error && error.code === "ECONNRESET"

/** Bun reuses keep-alive sockets S3 already closed after ~20s idle; one retry gets a fresh one. */
export async function getS3Object(key: string) {
  const request = () => getObject(getConfiguredS3Client(), { bucket: S3_BUCKET, key })
  try {
    return await request()
  } catch (error) {
    if (!isResetConnection(error)) throw error
    return request()
  }
}
