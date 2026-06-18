import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  CreateProjectRecordTemplateSchema,
  DeleteProjectRecordTemplateSchema,
  ProjectRecordTemplateByIdSchema,
  ProjectRecordTemplatesByProjectSchema,
  UpdateProjectRecordTemplateSchema,
} from "@/src/shared/projectRecordTemplates/schemas"
import {
  GetProjectRecordTemplatesSchema,
  GetProjectRecordTopicsAdminSchema,
} from "./projectRecordTemplates.inputSchemas"
import {
  createProjectRecordTemplate,
  deleteProjectRecordTemplate,
  getProjectRecordTemplate,
  getProjectRecordTemplates,
  getProjectRecordTemplatesByProject,
  getProjectRecordTopicsAdmin,
  updateProjectRecordTemplate,
} from "./projectRecordTemplates.server"
export const getProjectRecordTemplatesFn = createServerFn({ method: "GET" })
  .validator(GetProjectRecordTemplatesSchema)
  .handler(() => getProjectRecordTemplates(getRequestHeaders()))

export const getProjectRecordTemplatesByProjectFn = createServerFn({ method: "GET" })
  .validator(ProjectRecordTemplatesByProjectSchema)
  .handler(({ data }) => getProjectRecordTemplatesByProject(getRequestHeaders(), data))

export const getProjectRecordTemplateFn = createServerFn({ method: "GET" })
  .validator(ProjectRecordTemplateByIdSchema)
  .handler(({ data }) => getProjectRecordTemplate(getRequestHeaders(), data))

export const createProjectRecordTemplateFn = createServerFn({ method: "POST" })
  .validator(CreateProjectRecordTemplateSchema)
  .handler(({ data }) => createProjectRecordTemplate(getRequestHeaders(), data))

export const updateProjectRecordTemplateFn = createServerFn({ method: "POST" })
  .validator(UpdateProjectRecordTemplateSchema)
  .handler(({ data }) => updateProjectRecordTemplate(getRequestHeaders(), data))

export const deleteProjectRecordTemplateFn = createServerFn({ method: "POST" })
  .validator(DeleteProjectRecordTemplateSchema)
  .handler(({ data }) => deleteProjectRecordTemplate(getRequestHeaders(), data))

export const getProjectRecordTopicsAdminFn = createServerFn({ method: "GET" })
  .validator(GetProjectRecordTopicsAdminSchema)
  .handler(() => getProjectRecordTopicsAdmin(getRequestHeaders()))
