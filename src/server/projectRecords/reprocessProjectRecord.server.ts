import { z } from "zod"
import { reprocessProjectRecordWithAi } from "@/src/server/ai/reprocessProjectRecord.server"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { authorizeProjectMemberByProjectSlug } from "@/src/server/authorization/authorizeProjectMember.server"
import { editorRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { extractEmailData } from "@/src/server/projectRecordEmails/incoming/extractEmailData.server"
import { fetchProjectContext } from "@/src/server/projectRecordEmails/incoming/fetchProjectContext.server"
import { ReprocessProjectRecordSchema } from "./reprocessProjectRecord.inputSchemas"

export { ReprocessProjectRecordSchema }

export async function reprocessProjectRecord(
  headers: Headers,
  input: z.infer<typeof ReprocessProjectRecordSchema>,
) {
  const session = await endpointAuth.session(headers)
  await authorizeProjectMemberByProjectSlug(session, input.projectSlug, editorRoles)

  console.log("Reprocessing projectRecord from user:", session.userId)

  const projectRecord = await db.projectRecord.findFirst({
    where: { id: input.projectRecordId },
    include: {
      project: { select: { slug: true } },
      uploads: {
        select: {
          id: true,
          title: true,
          summary: true,
        },
      },
    },
  })

  if (!projectRecord) {
    throw new Error("ProjectRecord not found")
  }

  if (projectRecord.project.slug !== input.projectSlug) {
    throw new Error("ProjectRecord does not belong to the specified project")
  }

  console.log(`Found projectRecord ${input.projectRecordId} for project ${projectRecord.projectId}`)

  let initialEmailBody: string | null = null
  let emailSubject: string | null = null
  let emailFrom: string | null = null

  if (projectRecord.projectRecordEmailId) {
    const projectRecordEmail = await db.projectRecordEmail.findUnique({
      where: { id: projectRecord.projectRecordEmailId },
    })

    if (projectRecordEmail) {
      console.log(`Found related projectRecord email ${projectRecord.projectRecordEmailId}`)
      const emailData = await extractEmailData({ projectRecordEmail })
      initialEmailBody = emailData.body
      emailSubject = emailData.subject
      emailFrom = emailData.from
    }
  } else {
    console.log("No related projectRecord email found")
  }

  console.log(`Found ${projectRecord.uploads.length} uploads related to projectRecord`)

  const projectContext = await fetchProjectContext({
    projectId: projectRecord.projectId,
  })

  const finalResult = await reprocessProjectRecordWithAi({
    projectRecordBody: projectRecord.body || "",
    emailBody: initialEmailBody,
    uploads: projectRecord.uploads,
    projectContext,
    userId: session.userId,
    subject: emailSubject,
    from: emailFrom,
  })

  return {
    aiSuggestions: {
      title: finalResult.title,
      body: finalResult.body,
      date: finalResult.date ? new Date(finalResult.date) : new Date(),
      projectRecordTopics: finalResult.topics?.map((id) => parseInt(id, 10)) || [],
    },
  }
}
