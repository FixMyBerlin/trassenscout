import type { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { authorizeProjectMemberByProjectSlug } from "@/src/server/authorization/authorizeProjectMember.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { GetContactSchema, type GetContactsInput } from "@/src/shared/contacts/schemas"
import { contactInclude } from "../contactInclude"
import { contactInProjectWhere } from "../contactScope"

export async function getContacts(headers: Headers, input: GetContactsInput) {
  const session = await endpointAuth.session(headers)
  await authorizeProjectMemberByProjectSlug(session, input.projectSlug, viewerRoles)

  const contacts = await db.contact.findMany({
    where: { project: { slug: input.projectSlug } },
    orderBy: { id: "asc" },
    include: contactInclude,
  })

  return { contacts }
}

export async function getContact(headers: Headers, input: z.infer<typeof GetContactSchema>) {
  const session = await endpointAuth.session(headers)
  await authorizeProjectMemberByProjectSlug(session, input.projectSlug, viewerRoles)

  return db.contact.findFirstOrThrow({
    where: contactInProjectWhere(input.projectSlug, input.id),
    include: contactInclude,
  })
}
