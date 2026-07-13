import { queryOptions } from "@tanstack/react-query"
import {
  getAdminProjectsWithCountsFn,
  getProjectBySlugFn,
  getProjectsAdminFn,
  getProjectsForCurrentUserFn,
  getProjectsWithGeometryWithMembershipRoleFn,
} from "./projects.functions"

export function projectsForCurrentUserQueryOptions() {
  return queryOptions({
    queryKey: ["projects", "currentUser"],
    queryFn: () => getProjectsForCurrentUserFn(),
  })
}

export function projectsWithGeometryWithMembershipRoleQueryOptions() {
  return queryOptions({
    queryKey: ["projects", "withGeometryWithMembershipRole"],
    queryFn: () => getProjectsWithGeometryWithMembershipRoleFn(),
  })
}

export function adminProjectsWithCountsQueryOptions() {
  return queryOptions({
    queryKey: ["projects", "adminWithCounts"],
    queryFn: () => getAdminProjectsWithCountsFn(),
  })
}

export function projectBySlugQueryOptions(projectSlug: string) {
  return queryOptions({
    queryKey: ["projects", projectSlug],
    queryFn: () => getProjectBySlugFn({ data: { projectSlug } }),
  })
}

export function projectsAdminQueryOptions() {
  return queryOptions({
    queryKey: ["projects", "admin"],
    queryFn: () => getProjectsAdminFn({ data: {} }),
  })
}
