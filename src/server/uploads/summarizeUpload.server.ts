import { S3ServiceException } from "@aws-sdk/client-s3"
import { z } from "zod"
import { isPdf } from "@/src/components/core/uploads/getFileType"
import { summarizePdfUpload } from "@/src/server/ai/summarizePdfUpload.server"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { authorizeProjectMemberByProjectSlug } from "@/src/server/authorization/authorizeProjectMember.server"
import { editorRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { assertProjectAiEnabled } from "@/src/server/projectRecordEmails/incoming/checkProjectAiEnabled.server"
import { fetchProjectContext } from "@/src/server/projectRecordEmails/incoming/fetchProjectContext.server"
import { fetchPdfFromS3 } from "@/src/server/uploads/fetchPdfFromS3.server"
import { SummarizeUploadSchema } from "./summarizeUpload.inputSchemas"

export { SummarizeUploadSchema }

export async function summarizeUpload(
  headers: Headers,
  input: z.infer<typeof SummarizeUploadSchema>,
) {
  const session = await endpointAuth.session(headers)

  try {
    await authorizeProjectMemberByProjectSlug(session, input.projectSlug, editorRoles)

    console.log("Summarize called by user:", session.userId)
    console.log("Upload ID:", input.uploadId)

    const upload = await db.upload.findFirstOrThrow({
      where: { id: input.uploadId },
      include: { project: { select: { slug: true, id: true } } },
    })

    if (!upload.project) {
      throw new Error("Upload is not associated with a project")
    }

    if (upload.project.slug !== input.projectSlug) {
      throw new Error("Upload does not belong to the specified project")
    }

    await assertProjectAiEnabled(upload.project.id)

    if (!isPdf(upload)) {
      throw new Error("Only PDF files are supported for summarization")
    }

    const pdfData = await fetchPdfFromS3({ externalUrl: upload.externalUrl })
    const projectContext = await fetchProjectContext({ projectId: upload.project.id })

    const summary = await summarizePdfUpload({
      pdfData,
      userId: session.userId,
      projectContext,
    })

    return { summary }
  } catch (error) {
    console.error("Error in summarize action:", error)

    if (error instanceof S3ServiceException) {
      throw new Error(`S3 error: ${error.name}`)
    }

    if (error instanceof Error) {
      throw error
    }

    throw new Error("Unknown error occurred")
  }
}
