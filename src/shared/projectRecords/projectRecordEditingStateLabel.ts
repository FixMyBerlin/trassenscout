import { ProjectRecordEditingState } from "@/src/prisma/generated/browser"

export const projectRecordEditingStateLabel: Record<ProjectRecordEditingState, string> = {
  [ProjectRecordEditingState.PENDING]: "In Bearbeitung",
  [ProjectRecordEditingState.COMPLETED]: "Abgeschlossen",
}
