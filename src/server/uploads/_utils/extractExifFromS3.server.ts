import { GetObjectCommand } from "@aws-sdk/client-s3"
import exifr from "exifr"
import { S3_BUCKET } from "@/src/shared/uploads/config"
import { getS3KeyFromUrl } from "@/src/shared/uploads/url"
import { getAwsSdkS3Client } from "./s3Client.server"

const EXIF_READ_SIZE = 64 * 1024 // 64KB - enough for EXIF data which is at the start of the file

/**
 * Extracts GPS coordinates (latitude/longitude) from an image file stored in S3.
 * Only reads the first 64KB of the file where EXIF data is located.
 *
 * @param externalUrl - The S3 URL of the image file
 * @returns Object with latitude and longitude, or null if not found or not an image
 */
export async function extractExifFromS3(externalUrl: string) {
  // Test mode serves stub uploads that never exist in S3 (see serveUploadObject.server.ts)
  if (process.env.VITE_IS_TEST === "true") return null

  try {
    const key = getS3KeyFromUrl(externalUrl)
    const s3Client = getAwsSdkS3Client()

    // Use Range request to only fetch the first 64KB where EXIF data is located
    // This requires AWS SDK directly as Better Upload's getObject() doesn't support range requests
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Range: `bytes=0-${EXIF_READ_SIZE - 1}`,
    })

    const response = await s3Client.send(command)
    const stream = response.Body as NodeJS.ReadableStream

    // Convert stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk))
    }
    const buffer = Buffer.concat(chunks)

    // Extract GPS data using exifr.gps()
    const gpsData = await exifr.gps(buffer)

    if (gpsData?.latitude && gpsData?.longitude) {
      return {
        latitude: gpsData.latitude as number,
        longitude: gpsData.longitude as number,
      }
    }

    return null
  } catch (error) {
    console.error("[EXIF] Error extracting EXIF data from S3:", externalUrl, error)
    return null
  }
}
