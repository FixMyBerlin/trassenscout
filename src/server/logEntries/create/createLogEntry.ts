import db, { LogLevelActionEnum } from "@/db"
import { deepDiff } from "datum-merge"
import getProjectIdBySlug from "../../projects/queries/getProjectIdBySlug"

type LogEntryCreate = {
  userId?: number | null
  action: LogLevelActionEnum
  message: string
  //
  inviteId?: number
  membershipId?: number
  calendarentryId?: number
  contactId?: number
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

  const diff = deepDiff(
    replaceGeometryIfPresent(previousRecord),
    replaceGeometryIfPresent(updatedRecord),
  )

  // We skip the logs for updates if the update only changes the "updatedAt"
  const onlyUpdatedAtChanged =
    diff !== false && diff.filter((e) => e.path.join("") !== "updatedAt").length === 0
  if (input.action === "UPDATE" && (diff === false || onlyUpdatedAtChanged)) {
    return
  }

  return await db.logEntry.create({
    data: {
      action: data.action,
      userId: data.userId || undefined,
      message: data.message,
      projectId:
        "projectSlug" in data ? await getProjectIdBySlug(data.projectSlug) : data.projectId,
      changes: diff === false ? undefined : diff,
      //
      inviteId: data.inviteId,
      membershipId: data.membershipId,
      calendarentryId: data.calendarentryId,
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
