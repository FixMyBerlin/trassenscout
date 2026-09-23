import type { z } from "zod"
import type { LogEntriesCursorSchema } from "./logEntries.inputSchemas"
import type { getLogEntries } from "./logEntries.server"

type LogEntriesList = Awaited<ReturnType<typeof getLogEntries>>

export type LogEntryRow = LogEntriesList["logEntries"][number]

export type LogEntriesCursor = z.infer<typeof LogEntriesCursorSchema>
