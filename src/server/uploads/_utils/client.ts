import { S3Client } from "@aws-sdk/client-s3"
import { aws } from "@better-upload/server/clients"
import { S3_REGION } from "./config"

/**
 * Creates a configured AWS S3 client using Better Upload's AWS client factory.
 *
 * Use this client when working with Better Upload's helper functions from @better-upload/server/helpers:
 * - putObject() - Upload an object to S3
 * - getObject() - Retrieve an object from S3
 * - deleteObject() - Delete an object from S3
 * - headObject() - Get object metadata without downloading content
 * - copyObject() - Copy an object within or between buckets
 * - moveObject() - Move (rename) an object within or between buckets
 * - presignGetObject() - Generate a pre-signed URL for downloading an object
 *
 * @returns Configured AWS S3 client instance compatible with Better Upload
 */
export function getConfiguredS3Client() {
  return aws({
    accessKeyId: process.env.S3_UPLOAD_KEY,
    secretAccessKey: process.env.S3_UPLOAD_SECRET,
    region: S3_REGION,
  })
}

/**
 * Creates a native AWS SDK S3 client for direct use with AWS SDK commands.
 *
 * Use this client only when you need operations that Better Upload doesn't support:
 * - Range requests (partial file reads with GetObjectCommand and Range header)
 * - Custom request configurations
 * - Direct AWS SDK command usage
 *
 * For most operations, prefer Better Upload helpers:
 * - putObject() - for uploading files/buffers
 * - getObject() - for retrieving full objects
 * - deleteObject() - for deleting objects
 * - etc.
 *
 * @returns Native AWS SDK S3Client instance
 */
export function getAwsSdkS3Client() {
  return new S3Client({
    credentials: {
      accessKeyId: process.env.S3_UPLOAD_KEY,
      secretAccessKey: process.env.S3_UPLOAD_SECRET,
    },
    region: S3_REGION,
  })
}
