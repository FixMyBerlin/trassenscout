"use server"

import db from "@/db"
import { fetchPdfFromS3 } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_actions/summarizeUpload/fetchPdfFromS3"
import { generatePdfSummaryWithAI } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_actions/summarizeUpload/generatePdfSummaryWithAI"
import { validatePdfFile } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_actions/summarizeUpload/validatePdfFile"
import { authorizeProjectMember } from "@/src/app/(loggedInProjects)/_utils/authorizeProjectMember"
import { checkProjectAiEnabled } from "@/src/app/api/(apiKey)/process-project-record-email/_utils/checkProjectAiEnabled"
import { fetchProjectContext } from "@/src/app/api/(apiKey)/process-project-record-email/_utils/fetchProjectContext"
import { editorRoles } from "@/src/authorization/constants"
import { getBlitzContext } from "@/src/blitz-server"

import { S3ServiceException } from "@aws-sdk/client-s3"

// if we use ai streaming in future, we need to handle this as an api route (not a server function)

export const summarizeUpload = async ({
  uploadId,
  projectSlug,
}: {
  uploadId: number
  projectSlug: string
}) => {
  try {
    await authorizeProjectMember(projectSlug, editorRoles)

    const { session } = await getBlitzContext()

    console.log("Summarize called by user:", session.userId)
    console.log("Upload ID:", uploadId)

    // Get upload details with project info for authorization
    const upload = await db.upload.findFirstOrThrow({
      where: { id: uploadId },
      include: { project: { select: { slug: true, id: true } } },
    })

    // Check if AI enabled for the project
    await checkProjectAiEnabled(upload.project.id)

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
      // We are sure that userId is defined here due to the authorization check above
      userId: session.userId!,
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
