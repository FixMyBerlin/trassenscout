import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { UpdateProjectSchema } from "@/src/shared/projects/schemas"
import {
  CreateProjectSchema,
  GetProjectBySlugSchema,
  GetProjectsAdminSchema,
  UpdateProjectsFeatureFlagSchema,
} from "./projects.inputSchemas"
import {
  createProject,
  getAdminProjectsWithCounts,
  getProjectBySlug,
  getProjectsAdmin,
  getProjectsForCurrentUser,
  updateProject,
  updateProjectsFeatureFlag,
} from "./projects.server"
import { getProjectsWithGeometryWithMembershipRole } from "./queries/getProjectsWithGeometryWithMembershipRole.server"

export const getProjectsForCurrentUserFn = createServerFn({ method: "GET" }).handler(() =>
  getProjectsForCurrentUser(getRequestHeaders()),
)

export const getProjectsWithGeometryWithMembershipRoleFn = createServerFn({
  method: "GET",
}).handler(() => getProjectsWithGeometryWithMembershipRole(getRequestHeaders()))

export const getAdminProjectsWithCountsFn = createServerFn({ method: "GET" }).handler(() =>
  getAdminProjectsWithCounts(getRequestHeaders()),
)

export const getProjectBySlugFn = createServerFn({ method: "GET" })
  .validator(GetProjectBySlugSchema)
  .handler(({ data }) => getProjectBySlug(getRequestHeaders(), data))

export const updateProjectFn = createServerFn({ method: "POST" })
  .validator(UpdateProjectSchema)
  .handler(({ data }) => updateProject(getRequestHeaders(), data))

export const getProjectsAdminFn = createServerFn({ method: "GET" })
  .validator(GetProjectsAdminSchema)
  .handler(() => getProjectsAdmin(getRequestHeaders()))

export const createProjectFn = createServerFn({ method: "POST" })
  .validator(CreateProjectSchema)
  .handler(({ data }) => createProject(getRequestHeaders(), data))

export const updateProjectsFeatureFlagFn = createServerFn({ method: "POST" })
  .validator(UpdateProjectsFeatureFlagSchema)
  .handler(({ data }) => updateProjectsFeatureFlag(getRequestHeaders(), data))
