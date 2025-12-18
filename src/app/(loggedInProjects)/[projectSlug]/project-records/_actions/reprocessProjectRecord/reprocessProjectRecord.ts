"use server"

import { generateProjectRecordWithAI } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_actions/reprocessProjectRecord/generateProjectRecordWithAI"
import { authorizeProjectMember } from "@/src/app/(loggedInProjects)/_utils/authorizeProjectMember"
import { extractEmailData } from "@/src/app/api/(apiKey)/process-project-record-email/_utils/extractEmailData"
import { fetchProjectContext } from "@/src/app/api/(apiKey)/process-project-record-email/_utils/fetchProjectContext"
import { editorRoles } from "@/src/authorization/constants"
import { getBlitzContext } from "@/src/blitz-server"
import db from "db"

/**
 * NOTE: All parts related to subsections and subsubsections are temporarily commented out
 * as we are not yet sure how the customer uses this feature.
 */
// tbd: do we want to overwrite relations (subsections, subsubsections, uploads, tags) or only recreate the body?
export const reprocessProjectRecord = async ({
  projectRecordId,
  projectSlug,
}: {
  projectRecordId: number
  projectSlug: string
}) => {
  await authorizeProjectMember(projectSlug, editorRoles)

  const { session } = await getBlitzContext()

  console.log("Reprocessing projectRecord from user:", session.userId)

  // Fetch the projectRecord from DB
  const projectRecord = await db.projectRecord.findFirst({
    where: { id: projectRecordId },
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

  console.log(`Found projectRecord ${projectRecordId} for project ${projectRecord.projectId}`)

  // Fetch the related projectRecord-email and parse it to extract body, subject, and from
  let initialEmailBody: string | null = null
  let emailSubject: string | null = null
  let emailFrom: string | null = null

  if (projectRecord.projectRecordEmailId) {
    const projectRecordEmail = await db.projectRecordEmail.findUnique({
      where: { id: projectRecord.projectRecordEmailId },
    })

    if (projectRecordEmail) {
      console.log(`Found related projectRecord email ${projectRecord.projectRecordEmailId}`)
      // check if already processed and in db otherwise parse email
      // replace this function if subject/body/date are required
      const emailData = await extractEmailData({ projectRecordEmail })
      initialEmailBody = emailData.body
      emailSubject = emailData.subject
      emailFrom = emailData.from
    }
  } else {
    console.log("No related projectRecord email found")
  }

  console.log(`Found ${projectRecord.uploads.length} uploads related to projectRecord`)

  // Fetch project context
  const projectContext = await fetchProjectContext({
    projectId: projectRecord.projectId,
  })

  // Call AI generation
  const finalResult = await generateProjectRecordWithAI({
    projectRecordBody: projectRecord.body || "",
    emailBody: initialEmailBody,
    uploads: projectRecord.uploads,
    projectContext,
    // We are sure that userId is defined here due to the authorization check above
    userId: session.userId!,
    subject: emailSubject,
    from: emailFrom,
  })

  return {
    aiSuggestions: {
      title: finalResult.title,
      body: finalResult.body,
      date: finalResult.date ? new Date(finalResult.date) : new Date(),
      // subsectionId: finalResult.subsectionId ? parseInt(finalResult.subsectionId) : undefined,
      // subsubsectionId: finalResult.subsubsectionId ? parseInt(finalResult.subsubsectionId) : undefined,
      projectRecordTopics: finalResult.topics?.map((id) => parseInt(id)) || [],
    },
  }
}
