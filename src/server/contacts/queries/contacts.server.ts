import type { z } from "zod"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { authorizeProjectMemberByProjectSlug } from "@/src/server/authorization/authorizeProjectMember.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { paginate } from "@/src/server/utils/paginate.server"
import { GetContactSchema, type GetContactsInput } from "@/src/shared/contacts/schemas"
import { contactInProjectWhere } from "../contactScope"

export async function getContacts(headers: Headers, input: GetContactsInput) {
  const session = await endpointAuth.session(headers)
  await authorizeProjectMemberByProjectSlug(session, input.projectSlug, viewerRoles)

  const { projectSlug, skip = 0, take = 100 } = input
  const safeWhere = { project: { slug: projectSlug } }
  const orderBy = { id: "asc" as const }

  const {
    items: contacts,
    hasMore,
    nextPage,
    count,
  } = await paginate({
    skip,
    take,
    count: () => db.contact.count({ where: safeWhere }),
    query: (paginateArgs) => db.contact.findMany({ ...paginateArgs, where: safeWhere, orderBy }),
  })

  return {
    contacts,
    nextPage,
    hasMore,
    count,
  }
}

export async function getContact(headers: Headers, input: z.infer<typeof GetContactSchema>) {
  const session = await endpointAuth.session(headers)
  await authorizeProjectMemberByProjectSlug(session, input.projectSlug, viewerRoles)

  return db.contact.findFirstOrThrow({
    where: contactInProjectWhere(input.projectSlug, input.id),
  })
}
