import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { getClient } from "./client"
import { getConfig, S3Config } from "./config"

export const generateTemporaryUrl = async (key: string, s3Config?: S3Config) => {
  let config = getConfig(s3Config)
  let client = getClient(s3Config)

  let command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
  })

  let url = await getSignedUrl(client, command, { expiresIn: 3600 })

  return url
}
