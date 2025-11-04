import db from "@/db"
import { getConfig } from "@/src/core/lib/next-s3-upload/src/utils/config"
import getUploadWithSubsections from "@/src/server/uploads/queries/getUploadWithSubsections"
import { GetObjectCommand, S3Client, S3ServiceException } from "@aws-sdk/client-s3"
import { getSession } from "@blitzjs/auth"
import { NotFoundError } from "@prisma/client/runtime/library"
import { AuthorizationError } from "blitz"
import { NextApiRequest, NextApiResponse } from "next"
import { ZodError } from "zod"

// todo
// app dir
// GET request

export default async function getUploadBuffer(req: NextApiRequest, res: NextApiResponse) {
  console.log("Buffer API called with:", {
    method: req.method,
    uploadId: req.query.uploadId,
    url: req.url,
  })

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const uploadId = Number(req.query.uploadId)
    console.log("Parsed uploadId:", uploadId)

    if (isNaN(uploadId)) {
      throw ["ts", 400, "Invalid upload ID"]
    }

    // tbd - maybe we only want one format
    const format = (req.query.format as "buffer" | "base64") || "base64"

    console.log("Looking up upload in database...")
    // Get project slug for authorization
    const {
      project: { slug: projectSlug },
    } = await db.upload.findFirstOrThrow({
      where: { id: uploadId },
      select: { project: { select: { slug: true } } },
    })
    console.log("Found project slug:", projectSlug)

    // Get session and perform authorization
    console.log("Getting session...")
    const session = await getSession(req, res)
    console.log("Session user:", session?.userId)

    console.log("Checking authorization...")
    const upload = await getUploadWithSubsections(
      { projectSlug, id: uploadId },
      // @ts-expect-error will work
      { session },
    )
    console.log("Authorization successful, upload found:", upload.id)

    // copied from download endpoint with additional PDF checks and buffer conversion
    const { hostname, pathname } = new URL(upload.externalUrl)
    const isAws = hostname.endsWith("amazonaws.com")
    if (!isAws) throw ["ts", 409, "Conflict"]

    // Check if file is a PDF based on URL and title
    const isPdf =
      upload.externalUrl.toLowerCase().endsWith(".pdf") ||
      upload.title.toLowerCase().endsWith(".pdf")

    if (!isPdf) {
      throw ["ts", 400, "Only PDF files are supported for buffer processing"]
    }

    const { accessKeyId, secretAccessKey, region } = getConfig()
    const s3Client = new S3Client({
      credentials: { accessKeyId, secretAccessKey },
      region,
    })

    const params = {
      Bucket: hostname.split(".")[0],
      Key: pathname.substring(1),
    }

    const response = await s3Client.send(new GetObjectCommand(params))

    // Additional PDF validation by checking content type
    if (response.ContentType && !response.ContentType.includes("pdf")) {
      throw ["ts", 400, "File is not a PDF"]
    }

    const stream = response.Body as NodeJS.ReadableStream

    // Convert stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk))
    }

    const buffer = Buffer.concat(chunks)

    // Check file size (optional - adjust limit as needed, 10MB default)
    const maxSizeBytes = 10 * 1024 * 1024 // 10MB
    if (buffer.length > maxSizeBytes) {
      throw ["ts", 413, "File too large for processing"]
    }

    const responseData = {
      success: true,
      uploadId,
      contentType: response.ContentType,
      size: buffer.length,
      title: upload.title,
      data: format === "base64" ? buffer.toString("base64") : buffer,
    }

    res.setHeader("Content-Type", "application/json")
    res.json(responseData)
  } catch (err) {
    console.error("Error in buffer API:", err)
    console.error("Error type:", typeof err)
    console.error("Error constructor:", err?.constructor?.name)

    let errorDetails: ["ts", number, string] | any[]
    if (err instanceof S3ServiceException) {
      const { name, $metadata } = err
      errorDetails = ["s3", $metadata.httpStatusCode!, name]
    } else if (err instanceof NotFoundError) {
      console.log("NotFoundError caught - upload ID probably does not exist")
      errorDetails = ["ts", 404, "NotFound"]
    } else if (err instanceof ZodError) {
      console.log("ZodError caught - validation failed")
      errorDetails = ["ts", 400, "BadRequest"]
    } else if (err instanceof AuthorizationError) {
      console.log("AuthorizationError caught - user not authorized")
      errorDetails = ["ts", 403, "Forbidden"]
    } else if (err instanceof Error) {
      console.log("Generic Error caught:", err.message)
      errorDetails = ["ts", 500, err.name]
    } else if (Array.isArray(err)) {
      console.log("Array error caught:", err)
      errorDetails = err
    } else {
      console.log("Unknown error type caught:", err)
      errorDetails = ["ts", 500, "Unknown"]
    }
    const [source, status, message] = errorDetails
    console.log("Sending error response:", { source, status, message })
    res.status(status).json({ error: true, source, status, message })
  }
}
