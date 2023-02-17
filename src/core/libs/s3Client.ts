import { S3Client } from "@aws-sdk/client-s3"

const REGION = "eu-central-1"
const BUCKET = "trassenscout"
// Create an Amazon S3 service client object.
const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
})

export { s3Client, BUCKET }
