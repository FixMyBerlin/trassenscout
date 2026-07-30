import type { getProjectUsers } from "./memberships.server"

export type ProjectUsersList = Awaited<ReturnType<typeof getProjectUsers>>
export type ProjectUser = ProjectUsersList[number]
