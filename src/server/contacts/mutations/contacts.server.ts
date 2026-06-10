import type { z } from "zod"
import { getFullname } from "@/src/components/core/users/getFullname"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { authorizeProjectMemberByProjectSlug } from "@/src/server/authorization/authorizeProjectMember.server"
import { editorRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug.server"
import { AuthorizationError } from "@/src/shared/auth/errors"
import {
  CreateContactSchema,
  DeleteContactSchema,
  UpdateContactSchema,
} from "@/src/shared/contacts/schemas"
import { contactInProjectWhere } from "../contactScope"

export async function createContact(headers: Headers, input: z.infer<typeof CreateContactSchema>) {
  const session = await endpointAuth.session(headers)
  await authorizeProjectMemberByProjectSlug(session, input.projectSlug, editorRoles)

  const { projectSlug, ...data } = input
  const projectId = await getProjectIdBySlug(projectSlug)
  const record = await db.contact.create({
    data: {
      projectId,
      ...data,
    },
  })

  await createLogEntry({
    action: "CREATE",
    message: `Neuer externer Kontakt ${record ? getFullname(record) : ""}`,
    userId: Number(session.userId),
    projectId,
    contactId: record.id,
  })

  return record
}

export async function updateContact(headers: Headers, input: z.infer<typeof UpdateContactSchema>) {
  const session = await endpointAuth.session(headers)
  await authorizeProjectMemberByProjectSlug(session, input.projectSlug, editorRoles)

  const { id, projectSlug, ...data } = input
  const scopedWhere = contactInProjectWhere(projectSlug, id)
  const previous = await db.contact.findFirst({ where: scopedWhere })
  if (!previous) {
    throw new AuthorizationError()
  }
  const record = await db.contact.update({
    where: { id: previous.id },
    data,
  })

  await createLogEntry({
    action: "UPDATE",
    message: "Externen Kontakt geändert",
    userId: Number(session.userId),
    projectSlug,
    previousRecord: previous,
    updatedRecord: record,
    contactId: record.id,
  })

  return record
}

export async function deleteContact(headers: Headers, input: z.infer<typeof DeleteContactSchema>) {
  const session = await endpointAuth.session(headers)
  await authorizeProjectMemberByProjectSlug(session, input.projectSlug, editorRoles)

  const scopedWhere = contactInProjectWhere(input.projectSlug, input.id)
  const contact = await db.contact.findFirst({
    where: scopedWhere,
    select: { firstName: true, lastName: true },
  })
  if (!contact) {
    throw new AuthorizationError()
  }
  const record = await db.contact.deleteMany({ where: scopedWhere })

  await createLogEntry({
    action: "DELETE",
    message: `Externen Kontakt ${contact ? getFullname(contact) : ""} gelöscht`,
    userId: Number(session.userId),
    projectSlug: input.projectSlug,
  })

  return record
}
