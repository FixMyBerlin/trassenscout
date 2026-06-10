import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  CreateProjectRecordCommentBySlugSchema,
  DeleteProjectRecordCommentSchema,
  GetProjectRecordCommentsSchema,
  UpdateProjectRecordCommentSchema,
} from "./projectRecordComments.inputSchemas"
import {
  createProjectRecordComment,
  deleteProjectRecordComment,
  getProjectRecordComments,
  updateProjectRecordComment,
} from "./projectRecordComments.server"
const _getProjectRecordCommentsFn = createServerFn({ method: "GET" })
  .inputValidator(GetProjectRecordCommentsSchema)
  .handler(({ data }) => getProjectRecordComments(getRequestHeaders(), data))

export const createProjectRecordCommentFn = createServerFn({ method: "POST" })
  .inputValidator(CreateProjectRecordCommentBySlugSchema)
  .handler(({ data }) => createProjectRecordComment(getRequestHeaders(), data))

export const updateProjectRecordCommentFn = createServerFn({ method: "POST" })
  .inputValidator(UpdateProjectRecordCommentSchema)
  .handler(({ data }) => updateProjectRecordComment(getRequestHeaders(), data))

export const deleteProjectRecordCommentFn = createServerFn({ method: "POST" })
  .inputValidator(DeleteProjectRecordCommentSchema)
  .handler(({ data }) => deleteProjectRecordComment(getRequestHeaders(), data))
