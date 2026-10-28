import { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import {
  DeleteProjectRecordEmailSchema,
  ProjectRecordEmailSchema,
  UpdateProjectRecordEmailSchema,
} from "@/src/shared/projectRecordEmails/schemas"
import { parseEmail } from "./incoming/parseEmail.server"
import { uploadEmailAttachments } from "./incoming/uploadEmailAttachments.server"
import { GetProjectRecordEmailsSchema } from "./projectRecordEmails.inputSchemas"

export const GetProjectRecordEmailSchema = z.object({ id: z.number() })
export const CreateProjectRecordEmailSchema = ProjectRecordEmailSchema

export type GetProjectRecordEmailsInput = z.infer<typeof GetProjectRecordEmailsSchema>

const projectRecordEmailInclude = {
  project: { select: { id: true, slug: true, subTitle: true, aiEnabled: true } },
  projectRecords: { select: { id: true, title: true } },
  uploads: { select: { id: true, title: true } },
} as const

// List select omits `text`/`textBody`: the raw email source can be
// megabytes per row, which stalls the SSR loader on /admin/project-record-emails
const projectRecordEmailListSelect = {
  id: true,
  createdAt: true,
  date: true,
  from: true,
  subject: true,
  projectId: true,
  discardedAt: true,
  ...projectRecordEmailInclude,
} as const

// Mails added or assigned by an admin get the parsing and attachment upload the listener does.
async function prepareProjectRecordEmailForInbox(projectRecordEmailId: number) {
  const email = await db.projectRecordEmail.findUniqueOrThrow({
    where: { id: projectRecordEmailId },
    select: {
      text: true,
      project: { select: { id: true, slug: true } },
      _count: { select: { uploads: true } },
    },
  })
  const { body, attachments, from, subject, date } = await parseEmail({ rawEmailText: email.text })

  await db.projectRecordEmail.update({
    where: { id: projectRecordEmailId },
    data: { textBody: body, from, subject, date },
  })

  if (email.project && email._count.uploads === 0) {
    await uploadEmailAttachments({
      attachments,
      projectId: email.project.id,
      projectSlug: email.project.slug,
      projectRecordEmailId,
    })
  }
}

export async function getProjectRecordEmails(
  headers: Headers,
  input: z.infer<typeof GetProjectRecordEmailsSchema>,
) {
  await endpointAuth.admin(headers)

  return db.projectRecordEmail.findMany({
    select: projectRecordEmailListSelect,
    orderBy: { createdAt: "desc" },
    where: input.projectId ? { projectId: input.projectId } : undefined,
  })
}

export async function getProjectRecordEmail(
  headers: Headers,
  input: z.infer<typeof GetProjectRecordEmailSchema>,
) {
  await endpointAuth.admin(headers)

  return db.projectRecordEmail.findUniqueOrThrow({
    include: projectRecordEmailInclude,
    where: { id: input.id },
  })
}

export async function createProjectRecordEmail(
  headers: Headers,
  input: z.infer<typeof CreateProjectRecordEmailSchema>,
) {
  await endpointAuth.admin(headers)

  const { id } = await db.projectRecordEmail.create({ data: input, select: { id: true } })
  await prepareProjectRecordEmailForInbox(id)

  return db.projectRecordEmail.findUniqueOrThrow({
    where: { id },
    include: projectRecordEmailInclude,
  })
}

export async function updateProjectRecordEmail(
  headers: Headers,
  input: z.infer<typeof UpdateProjectRecordEmailSchema>,
) {
  await endpointAuth.admin(headers)
  const { id, ...data } = input

  await db.projectRecordEmail.update({ where: { id }, data })
  await prepareProjectRecordEmailForInbox(id)

  return db.projectRecordEmail.findUniqueOrThrow({
    where: { id },
    include: projectRecordEmailInclude,
  })
}

export async function deleteProjectRecordEmail(
  headers: Headers,
  input: z.infer<typeof DeleteProjectRecordEmailSchema>,
) {
  await endpointAuth.admin(headers)

  return db.projectRecordEmail.delete({
    where: { id: input.id },
    include: projectRecordEmailInclude,
  })
}
