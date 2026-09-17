import type { LogLevelActionEnum } from "@/src/prisma/generated/browser"

export const logEntryActionLabel: Record<LogLevelActionEnum, string> = {
  CREATE: "Erstellt",
  UPDATE: "Aktualisiert",
  DELETE: "Gelöscht",
}

export const logEntryActionColorClasses: Record<LogLevelActionEnum, string> = {
  CREATE: "bg-teal-50  text-teal-800  ring-teal-600/20",
  UPDATE: "bg-purple-50  text-purple-800  ring-purple-600/20",
  DELETE: "bg-amber-50  text-amber-800  ring-amber-600/20",
}
