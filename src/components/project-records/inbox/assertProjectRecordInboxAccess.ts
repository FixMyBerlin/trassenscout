import type { QueryClient } from "@tanstack/react-query"
import { redirect } from "@tanstack/react-router"
import type { MembershipRoleEnum } from "@/src/prisma/generated/browser"
import { projectsForCurrentUserQueryOptions } from "@/src/server/projects/projectsQueryOptions"

// Admin-only for now (membershipRole null means admin), and only for projects with KI.
export async function assertProjectRecordInboxAccess({
  queryClient,
  membershipRole,
  projectSlug,
}: {
  queryClient: QueryClient
  membershipRole: MembershipRoleEnum | null | undefined
  projectSlug: string
}) {
  const projects = await queryClient.ensureQueryData(projectsForCurrentUserQueryOptions())
  const project = projects.find((p) => p.slug === projectSlug)
  if (membershipRole !== null || !project?.aiEnabled) {
    throw redirect({ to: "/$projectSlug/project-records", params: { projectSlug } })
  }
}
