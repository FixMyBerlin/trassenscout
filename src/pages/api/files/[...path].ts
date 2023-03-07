import db from "db"
import { NextApiRequest, NextApiResponse } from "next"
import {
  HeadObjectCommand,
  GetObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3"
import { getConfig } from "src/core/lib/next-s3-upload/src/utils/config"

export default async function (req: NextApiRequest, res: NextApiResponse) {
  try {
    const fileId: number = Number(req.query.path![0])
    if (isNaN(fileId)) throw ["ts", 400, "BadRequest"]

    const file = await db.file.findFirst({ where: { id: fileId } })
    if (!file) throw ["ts", 404, "NotFound"]

    const url = file.externalUrl
    const isS3 = new URL(file.externalUrl).host.endsWith("amazonaws.com")
    if (!isS3) throw ["ts", 409, "Conflict"]

    const { accessKeyId, secretAccessKey, region, bucket } = getConfig()
    const s3Client = new S3Client({
      credentials: { accessKeyId, secretAccessKey },
      region,
    })

    const key = new URL(url).pathname.substring(1)
    const params = { Bucket: bucket, Key: key }
    const headResponse = await s3Client.send(new HeadObjectCommand(params))

    res.setHeader("Content-Length", headResponse.ContentLength!)
    res.setHeader("Content-Type", headResponse.ContentType!)
    res.setHeader("ETag", headResponse.ETag!)
    res.setHeader("Pragma", "no-cache")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Expires", 0)

    const response = await s3Client.send(new GetObjectCommand(params))
    const stream = response.Body!

    await new Promise(async (resolve) => {
      // @ts-ignore
      stream.pipe(res)
      // @ts-ignore
      stream.on("end", resolve)
    })
  } catch (err) {
    let errorDetails
    if (err instanceof S3ServiceException) {
      const { name, $metadata } = err
      errorDetails = ["s3", $metadata.httpStatusCode!, name]
    } else if (err instanceof Error) {
      errorDetails = ["ts", 500, err.name]
    } else if (Array.isArray(err)) {
      errorDetails = err
    } else {
      errorDetails = ["ts", 500, "Unknown"]
    }
    const [source, status, message] = errorDetails
    res.status(status).json({ error: true, source, status, message })
    res.end()
  }
}
