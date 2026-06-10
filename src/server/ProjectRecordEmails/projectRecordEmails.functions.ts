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
  .inputValidator(GetProjectRecordEmailsSchema)
  .handler(({ data }) => getProjectRecordEmails(getRequestHeaders(), data))

export const getProjectRecordEmailFn = createServerFn({ method: "GET" })
  .inputValidator(GetProjectRecordEmailSchema)
  .handler(({ data }) => getProjectRecordEmail(getRequestHeaders(), data))

export const createProjectRecordEmailFn = createServerFn({ method: "POST" })
  .inputValidator(CreateProjectRecordEmailSchema)
  .handler(({ data }) => createProjectRecordEmail(getRequestHeaders(), data))

export const updateProjectRecordEmailFn = createServerFn({ method: "POST" })
  .inputValidator(UpdateProjectRecordEmailSchema)
  .handler(({ data }) => updateProjectRecordEmail(getRequestHeaders(), data))

export const deleteProjectRecordEmailFn = createServerFn({ method: "POST" })
  .inputValidator(DeleteProjectRecordEmailSchema)
  .handler(({ data }) => deleteProjectRecordEmail(getRequestHeaders(), data))

export const processProjectRecordEmailFn = createServerFn({ method: "POST" })
  .inputValidator(ProcessProjectRecordEmailSchema)
  .handler(({ data }) => processProjectRecordEmail(getRequestHeaders(), data))
