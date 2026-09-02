import { diff } from "datum-diff"
import { LogLevelActionEnum, type Prisma } from "@/src/prisma/generated/browser"
import db from "@/src/server/db.server"
import { getProjectIdBySlug } from "../../projects/queries/getProjectIdBySlug.server"

type LogEntryCreate = {
  userId?: number | null
  action: LogLevelActionEnum
  message: string
  //
  projectId?: number
  projectSlug?: string
  //
  inviteId?: number
  membershipId?: number
  contactId?: number
  projectRecordId?: number
  operatorId?: number
  subsectionId?: number
  subsubsectionId?: number
  acquisitionAreaId?: number
  networkhierarchyId?: number
  qualitylevelId?: number
  uploadId?: number
  surveyResponseId?: number
  surveyId?: number
  projectRecordCommentId?: number
  surveyResponseCommentId?: number
  supportDocumentId?: number
  // To compute the `changes`
  previousRecord?: Record<string, any> | null
  updatedRecord?: Record<string, any>
}

// We don't want to diff each coordinate change but we do want to see if something change, so we hash the geometry
const replaceGeometryIfPresent = (
  record: LogEntryCreate["previousRecord"] | LogEntryCreate["updatedRecord"],
) => {
  return record && "geometry" in record
    ? {
        ...record,
        geometry: JSON.stringify(record.geometry),
      }
    : record
}

const hasStoredChanges = (changes: unknown) => {
  if (changes == null) return false
  if (Array.isArray(changes)) return changes.length > 0
  if (typeof changes === "object") return Object.keys(changes).length > 0
  return true
}

export const createLogEntry = async (input: LogEntryCreate) => {
  const { previousRecord, updatedRecord, ...data } = input

  const hashedUpdated = replaceGeometryIfPresent(updatedRecord)
  const changes =
    input.action === "CREATE"
      ? hashedUpdated
      : (diff(replaceGeometryIfPresent(previousRecord), hashedUpdated) ?? []).filter(
          (entry) => entry.path.join("") !== "updatedAt",
        )

  if (input.action === "UPDATE" && !hasStoredChanges(changes)) {
    return
  }

  const projectId = data.projectSlug ? await getProjectIdBySlug(data.projectSlug) : data.projectId

  return await db.logEntry.create({
    data: {
      action: data.action,
      userId: data.userId || undefined,
      message: data.message,
      projectId: projectId || undefined,
      changes:
        hasStoredChanges(changes) && changes != null
          ? (changes as Prisma.InputJsonValue)
          : undefined,
      //
      inviteId: data.inviteId,
      membershipId: data.membershipId,
      contactId: data.contactId,
      operatorId: data.operatorId,
      subsectionId: data.subsectionId,
      subsubsectionId: data.subsubsectionId,
      acquisitionAreaId: data.acquisitionAreaId,
      networkhierarchyId: data.networkhierarchyId,
      qualitylevelId: data.qualitylevelId,
      uploadId: data.uploadId,
      surveyResponseId: data.surveyResponseId,
      surveyId: data.surveyId,
      projectRecordCommentId: data.projectRecordCommentId,
      surveyResponseCommentId: data.surveyResponseCommentId,
      projectRecordId: data.projectRecordId,
      supportDocumentId: data.supportDocumentId,
    },
  })
}
