import type { z } from "zod"
import { getFullname } from "@/src/components/core/users/getFullname"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { authorizeProjectMemberByProjectSlug } from "@/src/server/authorization/authorizeProjectMember.server"
import { editorRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { createLogEntry } from "@/src/server/logEntries/create/createLogEntry"
import { relationIds } from "@/src/server/logEntries/create/relationIds"
import { getProjectIdBySlug } from "@/src/server/projects/queries/getProjectIdBySlug.server"
import { AuthorizationError } from "@/src/shared/auth/errors"
import {
  CreateContactSchema,
  DeleteContactSchema,
  UpdateContactSchema,
} from "@/src/shared/contacts/schemas"
import { connectIds, idsFromFormValue, setIds } from "@/src/shared/prisma/connectIds"
import { contactInProjectWhere } from "../contactScope"

async function validateContactTags(projectSlug: string, tagIds: number[]) {
  if (!tagIds.length) return

  const tags = await db.tag.findMany({
    where: { id: { in: tagIds }, project: { slug: projectSlug } },
    select: { id: true },
  })

  if (tags.length !== tagIds.length) {
    throw new Error("Invalid tag")
  }
}

export async function createContact(headers: Headers, input: z.infer<typeof CreateContactSchema>) {
  const session = await endpointAuth.session(headers)
  await authorizeProjectMemberByProjectSlug(session, input.projectSlug, editorRoles)

  const { projectSlug, tags, ...data } = input
  const tagIds = idsFromFormValue(tags)
  await validateContactTags(projectSlug, tagIds)

  const projectId = await getProjectIdBySlug(projectSlug)
  const record = await db.contact.create({
    data: {
      projectId,
      ...data,
      tags: connectIds(tagIds),
    },
  })

  await createLogEntry({
    action: "CREATE",
    message: `Neuer externer Kontakt ${record ? getFullname(record) : ""} wurde erstellt.`,
    userId: Number(session.userId),
    projectId,
    contactId: record.id,
    updatedRecord: {
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      note: record.note,
      phone: record.phone,
      role: record.role,
      projectId: record.projectId,
      tagIds,
    },
  })

  return record
}

export async function updateContact(headers: Headers, input: z.infer<typeof UpdateContactSchema>) {
  const session = await endpointAuth.session(headers)
  await authorizeProjectMemberByProjectSlug(session, input.projectSlug, editorRoles)

  const { id, projectSlug, tags, ...data } = input
  const tagIds = idsFromFormValue(tags)
  await validateContactTags(projectSlug, tagIds)

  const scopedWhere = contactInProjectWhere(projectSlug, id)
  const previousRecord = await db.contact.findFirst({
    where: scopedWhere,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      note: true,
      phone: true,
      role: true,
      projectId: true,
      tags: { select: { id: true } },
    },
  })
  if (!previousRecord) {
    throw new AuthorizationError()
  }
  const record = await db.contact.update({
    where: { id: previousRecord.id },
    data: {
      ...data,
      tags: setIds(tagIds),
    },
    include: { tags: { select: { id: true } } },
  })

  await createLogEntry({
    action: "UPDATE",
    message: `Externer Kontakt ${getFullname(record)} wurde geändert.`,
    userId: Number(session.userId),
    projectSlug,
    previousRecord: {
      id: previousRecord.id,
      firstName: previousRecord.firstName,
      lastName: previousRecord.lastName,
      email: previousRecord.email,
      note: previousRecord.note,
      phone: previousRecord.phone,
      role: previousRecord.role,
      projectId: previousRecord.projectId,
      tagIds: relationIds(previousRecord.tags),
    },
    updatedRecord: {
      id: record.id,
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      note: record.note,
      phone: record.phone,
      role: record.role,
      projectId: record.projectId,
      tagIds: relationIds(record.tags),
    },
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
    select: { id: true, firstName: true, lastName: true },
  })
  if (!contact) {
    throw new AuthorizationError()
  }
  const record = await db.contact.deleteMany({ where: scopedWhere })

  await createLogEntry({
    action: "DELETE",
    message: `Externer Kontakt ${contact ? getFullname(contact) : ""} wurde gelöscht.`,
    userId: Number(session.userId),
    projectSlug: input.projectSlug,
    previousRecord: { id: contact.id },
  })

  return record
}
