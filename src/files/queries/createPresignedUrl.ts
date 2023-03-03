import { HttpRequest } from "@aws-sdk/protocol-http"
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner"
import { parseUrl } from "@aws-sdk/url-parser"
import { formatUrl } from "@aws-sdk/util-format-url"
import { Hash } from "@aws-sdk/hash-node"
import { getConfig } from "src/core/lib/next-s3-upload/src/utils/config"

const createPresignedUrl = async (url: string) => {
  const endpoint = parseUrl(url)
  const { accessKeyId, secretAccessKey, region } = getConfig()
  const presigner = new S3RequestPresigner({
    credentials: { accessKeyId, secretAccessKey },
    region,
    sha256: Hash.bind(null, "sha256"),
  })

  const signedUrlObject = await presigner.presign(new HttpRequest(endpoint), { expiresIn: 60 })
  return formatUrl(signedUrlObject)
}

export default createPresignedUrl
