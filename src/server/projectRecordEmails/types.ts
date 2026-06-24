import type { getProjectRecordEmails } from "./projectRecordEmails.server"

type ProjectRecordEmailsList = Awaited<ReturnType<typeof getProjectRecordEmails>>
export type ProjectRecordEmailWithRelations = ProjectRecordEmailsList[number]
