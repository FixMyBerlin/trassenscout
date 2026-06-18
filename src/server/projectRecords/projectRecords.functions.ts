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
  .validator(GetProjectRecordAdminSchema)
  .handler(({ data }) => getProjectRecordAdmin(getRequestHeaders(), data))

export const getProjectRecordsFn = createServerFn({ method: "GET" })
  .validator(GetProjectRecordsSchema)
  .handler(({ data }) => getProjectRecords(getRequestHeaders(), data))

export const getProjectRecordFn = createServerFn({ method: "GET" })
  .validator(GetProjectRecordSchema)
  .handler(({ data }) => getProjectRecord(getRequestHeaders(), data))

export const createProjectRecordFn = createServerFn({ method: "POST" })
  .validator(CreateProjectRecordBySlugSchema)
  .handler(({ data }) => createProjectRecord(getRequestHeaders(), data))

export const updateProjectRecordFn = createServerFn({ method: "POST" })
  .validator(UpdateProjectRecordBySlugSchema)
  .handler(({ data }) => updateProjectRecord(getRequestHeaders(), data))

export const deleteProjectRecordFn = createServerFn({ method: "POST" })
  .validator(DeleteProjectRecordBySlugSchema)
  .handler(({ data }) => deleteProjectRecord(getRequestHeaders(), data))

export const getProjectRecordsNeedsReviewFn = createServerFn({ method: "GET" })
  .validator(GetProjectRecordsSchema)
  .handler(({ data }) => getProjectRecordsNeedsReview(getRequestHeaders(), data))

export const getProjectRecordsTabCountsFn = createServerFn({ method: "GET" })
  .validator(GetProjectRecordsSchema)
  .handler(({ data }) => getProjectRecordsTabCounts(getRequestHeaders(), data))

export const getProjectRecordDeleteInfoFn = createServerFn({ method: "GET" })
  .validator(GetProjectRecordSchema)
  .handler(({ data }) => getProjectRecordDeleteInfo(getRequestHeaders(), data))

export const deleteProjectRecordWithUploadsDecisionFn = createServerFn({ method: "POST" })
  .validator(DeleteProjectRecordWithUploadsDecisionSchema)
  .handler(({ data }) => deleteProjectRecordWithUploadsDecision(getRequestHeaders(), data))

export const getProjectRecordsBySubsubsectionFn = createServerFn({ method: "GET" })
  .validator(GetProjectRecordsBySubsubsectionSchema)
  .handler(({ data }) => getProjectRecordsBySubsubsection(getRequestHeaders(), data))

export const getProjectRecordsByAcquisitionAreaFn = createServerFn({ method: "GET" })
  .validator(GetProjectRecordsByAcquisitionAreaSchema)
  .handler(({ data }) => getProjectRecordsByAcquisitionArea(getRequestHeaders(), data))
