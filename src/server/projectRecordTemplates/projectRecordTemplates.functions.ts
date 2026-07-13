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
  GetTagsAdminSchema,
} from "./projectRecordTemplates.inputSchemas"
import {
  createProjectRecordTemplate,
  deleteProjectRecordTemplate,
  getProjectRecordTemplate,
  getProjectRecordTemplates,
  getProjectRecordTemplatesByProject,
  getTagsAdmin,
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

export const getTagsAdminFn = createServerFn({ method: "GET" })
  .validator(GetTagsAdminSchema)
  .handler(() => getTagsAdmin(getRequestHeaders()))
