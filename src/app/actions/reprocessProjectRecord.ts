"use server"

import { getBlitzContext } from "@/src/blitz-server"
import { extractEmailData } from "@/src/server/ProjectRecordEmails/processEmail/extractEmailData"
import { fetchProjectContext } from "@/src/server/ProjectRecordEmails/processEmail/fetchProjectContext"
import { generateProjectRecordWithAI } from "@/src/server/projectRecords/reprocess/generateProjectRecordWithAI"
import db from "db"

// tbd: do we want to overwrite relations (subsections, subsubsections, uploads, tags) or only recreate the body?
export const reprocessProjectRecord = async ({ projectRecordId }: { projectRecordId: number }) => {
  // Authenticate request
  const { session } = await getBlitzContext()

  if (!session?.userId) {
    throw new Error("Authentication required")
  }

  console.log("Reprocessing projectRecord from user:", session.userId)

  // Fetch the projectRecord from DB
  const projectRecord = await db.projectRecord.findFirst({
    where: { id: projectRecordId },
    include: {
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

  // Check if user is admin or a project member with editor permissions
  const isAdmin = session.role === "ADMIN"

  // atm this is an ADMIN feature
  // uncomment if necessary
  // Check if AI enabled for the project
  // await checkProjectAiEnabled(projectRecord.projectId)

  if (!isAdmin) {
    throw new Error("You must be an admin or project editor to reprocess projectRecords")
  }

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
    userId: session.userId,
    subject: emailSubject,
    from: emailFrom,
  })

  return {
    aiSuggestions: {
      title: finalResult.title,
      body: finalResult.body,
      date: finalResult.date ? new Date(finalResult.date) : new Date(),
      subsectionId: finalResult.subsectionId ? parseInt(finalResult.subsectionId) : undefined,
      projectRecordTopics: finalResult.topics?.map((id) => parseInt(id)) || [],
    },
  }
}
