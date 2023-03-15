import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "@blitzjs/auth"
import db from "db"
import {
  S3Client,
  HeadObjectCommand,
  GetObjectCommand,
  S3ServiceException,
} from "@aws-sdk/client-s3"
import { getConfig } from "src/core/lib/next-s3-upload/src/utils/config"

export default async function (req: NextApiRequest, res: NextApiResponse) {
  try {
    const fileId: number = Number(req.query.path![0])
    if (isNaN(fileId)) throw ["ts", 400, "BadRequest"]

    const file = await db.file.findFirst({ where: { id: fileId } })
    if (!file) throw ["ts", 404, "NotFound"]

    const session = await getSession(req, res)
    if (!session.userId) throw ["ts", 401, "Unauthorized"]

    const user = await db.user.findFirst({ where: { id: session.userId } })
    if (!user) throw ["ts", 401, "Unauthorized"]

    if (user.role !== "ADMIN") {
      const membership = await db.membership.findFirst({
        where: { userId: session.userId, projectId: file.projectId },
      })
      if (!membership) throw ["ts", 403, "Forbidden"]
    }

    const { hostname, pathname } = new URL(file.externalUrl)
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
