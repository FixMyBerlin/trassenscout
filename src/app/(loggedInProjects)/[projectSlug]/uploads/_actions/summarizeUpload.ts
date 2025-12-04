"use server"

import db from "@/db"
import { editorRoles } from "@/src/authorization/constants"
import { getBlitzContext } from "@/src/blitz-server"
import { checkProjectAiEnabled } from "@/src/server/ProjectRecordEmails/processEmail/checkProjectAiEnabled"
import { fetchProjectContext } from "@/src/server/ProjectRecordEmails/processEmail/fetchProjectContext"
import { fetchPdfFromS3 } from "@/src/server/uploads/summarize/fetchPdfFromS3"
import { generatePdfSummaryWithAI } from "@/src/server/uploads/summarize/generatePdfSummaryWithAI"
import { validatePdfFile } from "@/src/server/uploads/summarize/validatePdfFile"
import { S3ServiceException } from "@aws-sdk/client-s3"

// tbd authorization can be moved to a shared
const authorizeUserForUpload = async ({
  userId,
  userRole,
  projectSlug,
}: {
  userId: number
  userRole: string | null | undefined
  projectSlug: string
}) => {
  // Check if user is admin
  if (userRole === "ADMIN") return

  // Check if user is member of the project with editor rights
  const membership = await db.membership.findFirst({
    where: { project: { slug: projectSlug }, user: { id: userId } },
  })

  if (!membership || !editorRoles.includes(membership.role)) {
    throw new Error("Editor access required")
  }
}

export const summarizeUpload = async ({ uploadId }: { uploadId: number }) => {
  try {
    const { session } = await getBlitzContext()

    // Authentication check
    if (!session?.userId) {
      throw new Error("Authentication required")
    }

    console.log("Summarize called by user:", session.userId)
    console.log("Upload ID:", uploadId)

    // Get upload details with project info for authorization
    const upload = await db.upload.findFirstOrThrow({
      where: { id: uploadId },
      include: { project: { select: { slug: true, id: true } } },
    })

    // Check if AI enabled for the project
    await checkProjectAiEnabled(upload.project.id)

    // Authorization check
    await authorizeUserForUpload({
      userId: session.userId,
      userRole: session.role,
      projectSlug: upload.project.slug,
    })

    // Validate PDF file
    const isPdf = validatePdfFile({ upload })
    if (!isPdf) {
      throw new Error("Only PDF files are supported for summarization")
    }

    // Fetch PDF from S3
    const pdfData = await fetchPdfFromS3({ externalUrl: upload.externalUrl })

    // Fetch project context
    const projectContext = await fetchProjectContext({ projectId: upload.project.id })

    // Generate summary
    const summary = await generatePdfSummaryWithAI({
      pdfData,
      userId: session.userId,
      projectContext,
    })

    return { summary }
  } catch (error) {
    console.error("Error in summarize action:", error)

    if (error instanceof S3ServiceException) {
      throw new Error(`S3 error: ${error.name}`)
    } else if (error instanceof Error) {
      throw error
    } else {
      throw new Error("Unknown error occurred")
    }
  }
}
