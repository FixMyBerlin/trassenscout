// We use this to select data which we then store in the session
// for easy access to the role and memberships.
export const selectUserFieldsForSession = {
  id: true,
  role: true,
  memberships: {
    select: {
      id: true,
      role: true,
      project: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
  },
}
