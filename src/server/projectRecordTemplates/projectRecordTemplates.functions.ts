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
  .inputValidator(GetProjectRecordTemplatesSchema)
  .handler(() => getProjectRecordTemplates(getRequestHeaders()))

export const getProjectRecordTemplatesByProjectFn = createServerFn({ method: "GET" })
  .inputValidator(ProjectRecordTemplatesByProjectSchema)
  .handler(({ data }) => getProjectRecordTemplatesByProject(getRequestHeaders(), data))

export const getProjectRecordTemplateFn = createServerFn({ method: "GET" })
  .inputValidator(ProjectRecordTemplateByIdSchema)
  .handler(({ data }) => getProjectRecordTemplate(getRequestHeaders(), data))

export const createProjectRecordTemplateFn = createServerFn({ method: "POST" })
  .inputValidator(CreateProjectRecordTemplateSchema)
  .handler(({ data }) => createProjectRecordTemplate(getRequestHeaders(), data))

export const updateProjectRecordTemplateFn = createServerFn({ method: "POST" })
  .inputValidator(UpdateProjectRecordTemplateSchema)
  .handler(({ data }) => updateProjectRecordTemplate(getRequestHeaders(), data))

export const deleteProjectRecordTemplateFn = createServerFn({ method: "POST" })
  .inputValidator(DeleteProjectRecordTemplateSchema)
  .handler(({ data }) => deleteProjectRecordTemplate(getRequestHeaders(), data))

export const getProjectRecordTopicsAdminFn = createServerFn({ method: "GET" })
  .inputValidator(GetProjectRecordTopicsAdminSchema)
  .handler(() => getProjectRecordTopicsAdmin(getRequestHeaders()))
