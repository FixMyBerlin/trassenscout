import { getConfig } from "@/src/core/lib/next-s3-upload/src/utils/config"
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export const fetchPdfFromS3 = async (externalUrl: string) => {
  const { hostname, pathname } = new URL(externalUrl)

  const { accessKeyId, secretAccessKey, region } = getConfig()
  const s3Client = new S3Client({
    credentials: { accessKeyId, secretAccessKey },
    region,
  })

  const s3Params = {
    Bucket: hostname.split(".")[0],
    Key: pathname.substring(1),
  }

  console.log("Fetching PDF from S3...")
  const response = await s3Client.send(new GetObjectCommand(s3Params))

  // Additional PDF validation by checking content type
  if (response.ContentType && !response.ContentType.includes("pdf")) {
    throw new Error("File is not a PDF")
  }

  const stream = response.Body as NodeJS.ReadableStream

  // Convert stream to buffer
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk))
  }

  const pdfData = Buffer.concat(chunks)

  // Check file size
  if (pdfData.length > MAX_FILE_SIZE_BYTES) {
    throw new Error("File too large for processing")
  }

  return pdfData
}
