import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  CreateProjectRecordBySlugSchema,
  DeleteProjectRecordBySlugSchema,
  DeleteProjectRecordWithUploadsDecisionSchema,
  GetProjectRecordAdminSchema,
  GetProjectRecordSchema,
  GetProjectRecordsByAcquisitionAreaSchema,
  GetProjectRecordsBySubsubsectionSchema,
  GetProjectRecordsSchema,
  UpdateProjectRecordBySlugSchema,
} from "./projectRecords.inputSchemas"
import {
  createProjectRecord,
  deleteProjectRecord,
  deleteProjectRecordWithUploadsDecision,
  getAllProjectRecordsAdmin,
  getProjectRecord,
  getProjectRecordAdmin,
  getProjectRecordDeleteInfo,
  getProjectRecords,
  getProjectRecordsByAcquisitionArea,
  getProjectRecordsBySubsubsection,
  getProjectRecordsNeedsReview,
  getProjectRecordsTabCounts,
  updateProjectRecord,
} from "./projectRecords.server"
export const getAllProjectRecordsAdminFn = createServerFn({ method: "GET" }).handler(() =>
  getAllProjectRecordsAdmin(getRequestHeaders()),
)

export const getProjectRecordAdminFn = createServerFn({ method: "GET" })
  .inputValidator(GetProjectRecordAdminSchema)
  .handler(({ data }) => getProjectRecordAdmin(getRequestHeaders(), data))

export const getProjectRecordsFn = createServerFn({ method: "GET" })
  .inputValidator(GetProjectRecordsSchema)
  .handler(({ data }) => getProjectRecords(getRequestHeaders(), data))

export const getProjectRecordFn = createServerFn({ method: "GET" })
  .inputValidator(GetProjectRecordSchema)
  .handler(({ data }) => getProjectRecord(getRequestHeaders(), data))

export const createProjectRecordFn = createServerFn({ method: "POST" })
  .inputValidator(CreateProjectRecordBySlugSchema)
  .handler(({ data }) => createProjectRecord(getRequestHeaders(), data))

export const updateProjectRecordFn = createServerFn({ method: "POST" })
  .inputValidator(UpdateProjectRecordBySlugSchema)
  .handler(({ data }) => updateProjectRecord(getRequestHeaders(), data))

export const deleteProjectRecordFn = createServerFn({ method: "POST" })
  .inputValidator(DeleteProjectRecordBySlugSchema)
  .handler(({ data }) => deleteProjectRecord(getRequestHeaders(), data))

export const getProjectRecordsNeedsReviewFn = createServerFn({ method: "GET" })
  .inputValidator(GetProjectRecordsSchema)
  .handler(({ data }) => getProjectRecordsNeedsReview(getRequestHeaders(), data))

export const getProjectRecordsTabCountsFn = createServerFn({ method: "GET" })
  .inputValidator(GetProjectRecordsSchema)
  .handler(({ data }) => getProjectRecordsTabCounts(getRequestHeaders(), data))

export const getProjectRecordDeleteInfoFn = createServerFn({ method: "GET" })
  .inputValidator(GetProjectRecordSchema)
  .handler(({ data }) => getProjectRecordDeleteInfo(getRequestHeaders(), data))

export const deleteProjectRecordWithUploadsDecisionFn = createServerFn({ method: "POST" })
  .inputValidator(DeleteProjectRecordWithUploadsDecisionSchema)
  .handler(({ data }) => deleteProjectRecordWithUploadsDecision(getRequestHeaders(), data))

export const getProjectRecordsBySubsubsectionFn = createServerFn({ method: "GET" })
  .inputValidator(GetProjectRecordsBySubsubsectionSchema)
  .handler(({ data }) => getProjectRecordsBySubsubsection(getRequestHeaders(), data))

export const getProjectRecordsByAcquisitionAreaFn = createServerFn({ method: "GET" })
  .inputValidator(GetProjectRecordsByAcquisitionAreaSchema)
  .handler(({ data }) => getProjectRecordsByAcquisitionArea(getRequestHeaders(), data))
