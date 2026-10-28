import db from "@/src/server/db.server"
import { notifyAdminsProjectRecordEmailReceived } from "./notifyAdminsProjectRecordEmailReceived.server"
import { notifyAdminsProjectRecordEmailWithoutProject } from "./notifyAdminsProjectRecordEmailWithoutProject.server"
import { notifySenderLegacyProtocolMailboxMoved } from "./notifySenderLegacyProtocolMailboxMoved.server"
import { parseEmail } from "./parseEmail.server"
import { uploadEmailAttachments } from "./uploadEmailAttachments.server"

export async function processIncomingProjectRecordEmail({
  projectSlug,
  rawEmailText,
}: {
  rawEmailText: string
  projectSlug?: string
}) {
  const project = projectSlug
    ? await db.project.findUnique({
        where: { slug: projectSlug },
      })
    : null

  const { body, attachments, from, fromAddress, to, cc, subject, date, isAutoReply } =
    await parseEmail({ rawEmailText })

  // Out-of-office replies must not trigger mails or land in the Posteingang.
  if (isAutoReply) {
    const projectRecordEmail = await db.projectRecordEmail.create({
      data: {
        text: rawEmailText,
        textBody: body,
        from,
        subject,
        date,
        projectId: project?.id ?? null,
        discardedAt: new Date(),
      },
    })

    return {
      success: false,
      projectRecordEmailId: projectRecordEmail.id,
      message: "Automatic reply. Email stored as discarded.",
    }
  }

  await notifySenderLegacyProtocolMailboxMoved({
    senderEmail: fromAddress,
    to,
    cc,
  })

  if (!project) {
    const projectRecordEmail = await db.projectRecordEmail.create({
      data: {
        text: rawEmailText,
        textBody: body,
        from,
        subject,
        date,
        projectId: null,
      },
    })

    await notifyAdminsProjectRecordEmailWithoutProject({
      projectSlug,
      senderEmail: from || "Unbekannt",
      emailSubject: subject,
      projectRecordEmailId: projectRecordEmail.id,
    })

    return {
      success: false,
      projectRecordEmailId: projectRecordEmail.id,
      message: !projectSlug
        ? "No Project Slug provided. Email stored but not processed."
        : `Project with slug '${projectSlug}' not found. Email stored but not processed.`,
    }
  }

  const projectRecordEmail = await db.projectRecordEmail.create({
    data: {
      text: rawEmailText,
      projectId: project.id,
      textBody: body,
      from,
      subject,
      date,
    },
  })

  // The AI only runs when someone processes the mail in the Posteingang.
  const { uploadIds } = await uploadEmailAttachments({
    attachments,
    projectId: project.id,
    projectSlug: project.slug,
    projectRecordEmailId: projectRecordEmail.id,
  })

  await notifyAdminsProjectRecordEmailReceived({
    projectSlug: project.slug,
    senderEmail: from || "Unbekannt",
    emailSubject: subject,
    projectRecordEmailId: projectRecordEmail.id,
  })

  return {
    success: true,
    projectRecordEmailId: projectRecordEmail.id,
    uploadIds,
    message: `Email stored in the Posteingang with ${uploadIds.length} attachment(s)`,
  }
}
