import db, { LogLevelActionEnum } from "@/db"
import { diff } from "datum-diff"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"

type LogEntryCreate = {
  userId?: number | null
  action: LogLevelActionEnum
  message: string
  //
  inviteId?: number
  membershipId?: number
  contactId?: number
  projectRecordId?: number
  operatorId?: number
  subsectionId?: number
  networkhierarchyId?: number
  qualitylevelId?: number
  stakeholdernoteId?: number
  uploadId?: number
  surveyResponseId?: number
  // To compute the `changes`
  previousRecord?: Record<string, any> | null
  updatedRecord?: Record<string, any>
} & (
  | {
      projectId: number
    }
  | {
      projectSlug: string
    }
)

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

export const createLogEntry = async (input: LogEntryCreate) => {
  const { previousRecord, updatedRecord, ...data } = input

  const changes = diff(
    replaceGeometryIfPresent(previousRecord),
    replaceGeometryIfPresent(updatedRecord),
  )

  // We skip the logs for updates if the update only changes the "updatedAt"
  const onlyUpdatedAtChanged = changes?.filter((e) => e.path.join("") !== "updatedAt").length === 0
  if (input.action === "UPDATE" && onlyUpdatedAtChanged) {
    return
  }

  return await db.logEntry.create({
    data: {
      action: data.action,
      userId: data.userId || undefined,
      message: data.message,
      projectId:
        "projectSlug" in data ? await getProjectIdBySlug(data.projectSlug) : data.projectId,
      changes: changes,
      //
      inviteId: data.inviteId,
      membershipId: data.membershipId,
      contactId: data.contactId,
      operatorId: data.operatorId,
      subsectionId: data.subsectionId,
      networkhierarchyId: data.networkhierarchyId,
      qualitylevelId: data.qualitylevelId,
      stakeholdernoteId: data.stakeholdernoteId,
      uploadId: data.uploadId,
      surveyResponseId: data.surveyResponseId,
    },
  })
}
