import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { UpdateProjectSchema } from "@/src/shared/projects/schemas"
import {
  CreateProjectSchema,
  GetProjectBySlugSchema,
  GetProjectsAdminSchema,
  UpdateProjectAiEnabledSchema,
  UpdateProjectExportApiSchema,
  UpdateProjectLandAcquisitionModuleEnabledSchema,
  UpdateProjectShowLogEntriesSchema,
} from "./projects.inputSchemas"
import {
  createProject,
  getAdminProjectsWithCounts,
  getProjectBySlug,
  getProjectsAdmin,
  getProjectsForCurrentUser,
  updateProject,
  updateProjectAiEnabled,
  updateProjectExportApi,
  updateProjectLandAcquisitionModuleEnabled,
  updateProjectShowLogEntries,
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
  .inputValidator(GetProjectBySlugSchema)
  .handler(({ data }) => getProjectBySlug(getRequestHeaders(), data))

export const updateProjectFn = createServerFn({ method: "POST" })
  .inputValidator(UpdateProjectSchema)
  .handler(({ data }) => updateProject(getRequestHeaders(), data))

export const getProjectsAdminFn = createServerFn({ method: "GET" })
  .inputValidator(GetProjectsAdminSchema)
  .handler(() => getProjectsAdmin(getRequestHeaders()))

export const createProjectFn = createServerFn({ method: "POST" })
  .inputValidator(CreateProjectSchema)
  .handler(({ data }) => createProject(getRequestHeaders(), data))

export const updateProjectShowLogEntriesFn = createServerFn({ method: "POST" })
  .inputValidator(UpdateProjectShowLogEntriesSchema)
  .handler(({ data }) => updateProjectShowLogEntries(getRequestHeaders(), data))

export const updateProjectAiEnabledFn = createServerFn({ method: "POST" })
  .inputValidator(UpdateProjectAiEnabledSchema)
  .handler(({ data }) => updateProjectAiEnabled(getRequestHeaders(), data))

export const updateProjectLandAcquisitionModuleEnabledFn = createServerFn({ method: "POST" })
  .inputValidator(UpdateProjectLandAcquisitionModuleEnabledSchema)
  .handler(({ data }) => updateProjectLandAcquisitionModuleEnabled(getRequestHeaders(), data))

export const updateProjectExportApiFn = createServerFn({ method: "POST" })
  .inputValidator(UpdateProjectExportApiSchema)
  .handler(({ data }) => updateProjectExportApi(getRequestHeaders(), data))
