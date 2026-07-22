import { shortTitle } from "@/src/components/core/components/text/titles"
import { roleTranslation } from "@/src/components/core/users/roleTranslation.const"
import type { MembershipRoleEnum } from "@/src/prisma/generated/browser"

type InviteProject = {
  slug: string
  subTitle?: string | null
}

type InviteProjectRole = InviteProject & {
  role: MembershipRoleEnum
}

function formatProjectName(project: InviteProject) {
  return project.subTitle?.trim() || shortTitle(project.slug)
}

export function formatInviteProjects(projects: InviteProject[]) {
  const names = projects.map(formatProjectName)
  if (names.length <= 2) return names.join(" und ")
  return `${names.slice(0, -1).join(", ")} und ${names.at(-1)}`
}

export function formatInviteProjectRoles(projects: InviteProjectRole[]) {
  return projects
    .map((project) => `${formatProjectName(project)} (${roleTranslation[project.role]})`)
    .join(", ")
}
