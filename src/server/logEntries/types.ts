import type { getLogEntries } from "./logEntries.server"

type LogEntriesList = Awaited<ReturnType<typeof getLogEntries>>

export type LogEntryRow = LogEntriesList["logEntries"][number]
