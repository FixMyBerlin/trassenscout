import { HttpRequest } from "@aws-sdk/protocol-http"
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner"
import { parseUrl } from "@aws-sdk/url-parser"
import { formatUrl } from "@aws-sdk/util-format-url"
import { Hash } from "@aws-sdk/hash-node"
import { getS3Config } from "src/core/utils/getS3Config"

const createPresignedUrl = async (url: string) => {
  const endpoint = parseUrl(url)
  const { accessKeyId, secretAccessKey, region } = getS3Config()
  const presigner = new S3RequestPresigner({
    credentials: { accessKeyId, secretAccessKey },
    region,
    sha256: Hash.bind(null, "sha256"),
  })

  const signedUrlObject = await presigner.presign(new HttpRequest(endpoint), { expiresIn: 60 })
  return formatUrl(signedUrlObject)
}

export default createPresignedUrl
