import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  DeleteProjectRecordEmailSchema,
  UpdateProjectRecordEmailSchema,
} from "@/src/shared/projectRecordEmails/schemas"
import {
  CreateProjectRecordEmailSchema,
  GetProjectRecordEmailSchema,
  GetProjectRecordEmailsSchema,
  ProcessProjectRecordEmailSchema,
} from "./projectRecordEmails.inputSchemas"
import {
  createProjectRecordEmail,
  deleteProjectRecordEmail,
  getProjectRecordEmail,
  getProjectRecordEmails,
  processProjectRecordEmail,
  updateProjectRecordEmail,
} from "./projectRecordEmails.server"
export const getProjectRecordEmailsFn = createServerFn({ method: "GET" })
  .validator(GetProjectRecordEmailsSchema)
  .handler(({ data }) => getProjectRecordEmails(getRequestHeaders(), data))

export const getProjectRecordEmailFn = createServerFn({ method: "GET" })
  .validator(GetProjectRecordEmailSchema)
  .handler(({ data }) => getProjectRecordEmail(getRequestHeaders(), data))

export const createProjectRecordEmailFn = createServerFn({ method: "POST" })
  .validator(CreateProjectRecordEmailSchema)
  .handler(({ data }) => createProjectRecordEmail(getRequestHeaders(), data))

export const updateProjectRecordEmailFn = createServerFn({ method: "POST" })
  .validator(UpdateProjectRecordEmailSchema)
  .handler(({ data }) => updateProjectRecordEmail(getRequestHeaders(), data))

export const deleteProjectRecordEmailFn = createServerFn({ method: "POST" })
  .validator(DeleteProjectRecordEmailSchema)
  .handler(({ data }) => deleteProjectRecordEmail(getRequestHeaders(), data))

export const processProjectRecordEmailFn = createServerFn({ method: "POST" })
  .validator(ProcessProjectRecordEmailSchema)
  .handler(({ data }) => processProjectRecordEmail(getRequestHeaders(), data))
