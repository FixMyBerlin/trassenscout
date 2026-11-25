import { getFullnameWithInstitution } from "@/src/components/core/users/getFullname"
import { userCanLabel } from "@/src/components/shared/app/memberships/UserCanIcon"
import type { ProjectUser } from "@/src/server/memberships/types"
import type { TeamTableSortColumn } from "@/src/shared/contacts/searchSchemas"
import type { SortValues } from "@/src/shared/tableSort/sortRows"

export type TeamSortRow = Pick<
  ProjectUser,
  "firstName" | "lastName" | "institution" | "role" | "currentMembershipRole" | "isProjectLead"
>

export const teamSortValues: SortValues<TeamSortRow, TeamTableSortColumn> = {
  name: (user) => getFullnameWithInstitution(user),
  role: (user) => {
    const label = userCanLabel(user.currentMembershipRole, user.role === "ADMIN")
    return user.isProjectLead ? `${label} Projektleitung` : label
  },
}
