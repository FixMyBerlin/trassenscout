import { getFullname } from "@/src/components/core/users/getFullname"

type ProjectLike = {
  id: number
  slug: string
}

type UserLike = {
  id: number
  firstName: string | null
  lastName: string | null
  email: string
  role: string
  memberships: {
    role: "VIEWER" | "EDITOR"
    project: { id: number; slug: string }
  }[]
}

function normalizeMembershipsSearchQuery(query: string) {
  return query.trim().toLowerCase()
}

export function filterMembershipsTable({
  users,
  projects,
  userQuery,
  projectQuery,
}: {
  users: UserLike[]
  projects: ProjectLike[]
  userQuery: string
  projectQuery: string
}) {
  const normalizedUserQuery = normalizeMembershipsSearchQuery(userQuery)
  const normalizedProjectQuery = normalizeMembershipsSearchQuery(projectQuery)

  const filteredUsers = normalizedUserQuery
    ? users.filter((user) => {
        const fullName = getFullname(user)?.toLowerCase() ?? ""
        return (
          fullName.includes(normalizedUserQuery) ||
          user.email.toLowerCase().includes(normalizedUserQuery)
        )
      })
    : users

  const filteredProjects = normalizedProjectQuery
    ? projects.filter((project) => project.slug.toLowerCase().includes(normalizedProjectQuery))
    : projects

  return { users: filteredUsers, projects: filteredProjects }
}
