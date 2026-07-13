import type {
  getAllProjectRecordsAdmin,
  getProjectRecord,
  getProjectRecordAdmin,
  getProjectRecordDeleteInfo,
  getProjectRecords,
  getProjectRecordsByAcquisitionArea,
  getProjectRecordsBySubsubsection,
  getProjectRecordsNeedsReview,
} from "./projectRecords.server"

export type AdminProjectRecordWithRelations = Awaited<
  ReturnType<typeof getAllProjectRecordsAdmin>
>[number]
export type ProjectRecord = Awaited<ReturnType<typeof getProjectRecord>>
export type ProjectRecordAdmin = Awaited<ReturnType<typeof getProjectRecordAdmin>>
export type ProjectRecordsList = Awaited<ReturnType<typeof getProjectRecords>>
export type ProjectRecordListItem = ProjectRecordsList[number]
export type ProjectRecordsBySubsubsection = Awaited<
  ReturnType<typeof getProjectRecordsBySubsubsection>
>
export type ProjectRecordsByAcquisitionArea = Awaited<
  ReturnType<typeof getProjectRecordsByAcquisitionArea>
>
export type ProjectRecordsNeedsReviewList = Awaited<ReturnType<typeof getProjectRecordsNeedsReview>>
export type ProjectRecordDeleteInfo = Awaited<ReturnType<typeof getProjectRecordDeleteInfo>>
