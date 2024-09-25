import { getConfig } from "@/src/core/lib/next-s3-upload/src/utils/config"
import getUploadWithSubsections from "@/src/uploads/queries/getUploadWithSubsections"
import {
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
  S3ServiceException,
} from "@aws-sdk/client-s3"
import { getSession } from "@blitzjs/auth"
import { NotFoundError } from "@prisma/client/runtime/library"
import { AuthorizationError } from "blitz"
import { NextApiRequest, NextApiResponse } from "next"
import { ZodError } from "zod"

export default async function downloadFile(req: NextApiRequest, res: NextApiResponse) {
  try {
    const upload = await getUploadWithSubsections(
      { id: Number(req.query.path![0]) },
      // @ts-ignore will work
      { session: await getSession(req, res) },
    )

    const { hostname, pathname } = new URL(upload.externalUrl)
    const isAws = hostname.endsWith("amazonaws.com")
    if (!isAws) throw ["ts", 409, "Conflict"]

    const { accessKeyId, secretAccessKey, region } = getConfig()
    const s3Client = new S3Client({
      credentials: { accessKeyId, secretAccessKey },
      region,
    })

    const params = {
      Bucket: hostname.split(".")[0],
      Key: pathname.substring(1),
    }

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
    let errorDetails: ["ts", number, string] | any[]
    if (err instanceof S3ServiceException) {
      const { name, $metadata } = err
      errorDetails = ["s3", $metadata.httpStatusCode!, name]
    } else if (err instanceof NotFoundError) {
      errorDetails = ["ts", 404, "NotFound"]
    } else if (err instanceof ZodError) {
      errorDetails = ["ts", 400, "BadRequest"]
    } else if (err instanceof AuthorizationError) {
      errorDetails = ["ts", 403, "Forbidden"]
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
