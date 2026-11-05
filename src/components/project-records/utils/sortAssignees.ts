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
      Number(leadIds.includes(b.id)) - Number(leadIds.includes(a.id)) ||
      (assignmentCounts[b.id] ?? 0) - (assignmentCounts[a.id] ?? 0),
  )
}
