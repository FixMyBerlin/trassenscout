import db from "@/db"
import { getBlitzContext } from "@/src/blitz-server"
import { model } from "@/src/core/ai/models"
import { getConfig } from "@/src/core/lib/next-s3-upload/src/utils/config"
import { GetObjectCommand, S3Client, S3ServiceException } from "@aws-sdk/client-s3"
import { generateText } from "ai"
import { Langfuse } from "langfuse"

// TODO
// in the future we should consider:
// split in 1. get the file 2. send to ai 3. save summary to db
// so we can call it externally (e.g., as a tool or in email processing pipeline)
// Note: External calls would need different authentication mechanism
// use streamText() from ai for user experience
// add hint for user in UI

const langfuse = new Langfuse({
  environment: process.env.NODE_ENV,
})

export async function POST(request: Request, { params }: { params: { uploadId: string } }) {
  try {
    const { session } = await getBlitzContext()

    // Authentication check
    if (!session?.userId) {
      return Response.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("Summarize API called by user:", session.userId)

    const uploadId = Number(params.uploadId)
    console.log("Parsed uploadId:", uploadId)

    if (isNaN(uploadId)) {
      return Response.json({ error: "Invalid upload ID" }, { status: 400 })
    }

    console.log("Looking up upload in database...")
    // Get upload details with project info for authorization
    const upload = await db.upload.findFirstOrThrow({
      where: { id: uploadId },
      include: { project: { select: { slug: true } } },
    })
    console.log("Found upload:", upload.id, "in project:", upload.project.slug)

    // Check if file is a PDF based on URL and title
    const isPdf =
      upload.externalUrl.toLowerCase().endsWith(".pdf") ||
      upload.title.toLowerCase().endsWith(".pdf")

    if (!isPdf) {
      return Response.json(
        { error: "Only PDF files are supported for summarization" },
        { status: 400 },
      )
    }

    // Get PDF from S3 (similar to buffer API)
    const { hostname, pathname } = new URL(upload.externalUrl)
    const isAws = hostname.endsWith("amazonaws.com")
    if (!isAws) {
      return Response.json({ error: "File not on AWS S3" }, { status: 409 })
    }

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
      return Response.json({ error: "File is not a PDF" }, { status: 400 })
    }

    const stream = response.Body as NodeJS.ReadableStream

    // Convert stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk))
    }

    const pdfData = Buffer.concat(chunks)

    // Check file size (optional - adjust limit as needed, 10MB default)
    const maxSizeBytes = 10 * 1024 * 1024 // 10MB
    if (pdfData.length > maxSizeBytes) {
      return Response.json({ error: "File too large for processing" }, { status: 413 })
    }

    console.log("Generating summary with AI...")

    const trace = langfuse.trace({
      name: "summarize-upload",
      userId: String(session?.userId),
    })

    // Generate summary using AI
    const { text } = await generateText({
      model: model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Create a concise summary of the following PDF document. The summary should be written in German and capture the main points and insights of the document. Focus on clarity and conciseness. Use Markdown formatting for better readability (e.g., **bold**, *italic*, lists, etc.). Format links as inline links like: [example.com](https://www.example.com/).`,
            },
          ],
        },
        {
          role: "user",
          content: [{ type: "file", data: pdfData, mimeType: "application/pdf" }],
        },
      ],
      experimental_telemetry: {
        isEnabled: true,
        functionId: "summarize-upload-function",
        metadata: {
          langfuseTraceId: trace.id,
        },
      },
    })

    console.log("AI Summary generated successfully")
    console.log("Summary:", text)

    // in ai stream functions: onFinish
    await langfuse.flushAsync()

    return Response.json({
      success: true,
      uploadId,
      summary: text,
      title: upload.title,
    })
  } catch (error) {
    console.error("Error in summarize API:", error)

    if (error instanceof S3ServiceException) {
      const { name, $metadata } = error
      return Response.json(
        { error: `S3 error: ${name}` },
        { status: $metadata.httpStatusCode || 500 },
      )
    } else if (error instanceof Error && error.message.includes("not found")) {
      return Response.json({ error: "Upload not found" }, { status: 404 })
    } else if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500 })
    } else {
      return Response.json({ error: "Unknown error occurred" }, { status: 500 })
    }
  }
}
