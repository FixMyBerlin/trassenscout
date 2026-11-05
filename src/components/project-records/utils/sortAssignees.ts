import {
  getUserComboboxItems,
  type UserSelectOptions,
} from "@/src/components/shared/app/users/utils/getUserSelectOptions"

type AssigneeRanking = {
  leadIds: number[]
  assignmentCounts: Record<string, number>
}

// The users arrive A-Z and sort is stable, so A-Z stays the tie-break.
export const sortAssignees = <TUser extends { id: number }>(
  users: TUser[],
  ranking: AssigneeRanking | undefined,
) => {
  if (!ranking) return users

  const { leadIds, assignmentCounts } = ranking
  return [...users].sort(
    (a, b) =>
      (assignmentCounts[b.id] ?? 0) - (assignmentCounts[a.id] ?? 0) ||
      Number(leadIds.includes(b.id)) - Number(leadIds.includes(a.id)),
  )
}

export const getAssigneeItems = (users: UserSelectOptions, ranking: AssigneeRanking | undefined) =>
  getUserComboboxItems(sortAssignees(users, ranking), ({ id }) =>
    ranking?.leadIds.includes(id) || ranking?.assignmentCounts[id] ? "Systemvorschläge" : undefined,
  )
