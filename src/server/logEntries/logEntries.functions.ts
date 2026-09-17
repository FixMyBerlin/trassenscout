import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { GetLogEntriesSchema } from "./logEntries.inputSchemas"
import { getGeneralLogEntries, getLogEntries } from "./logEntries.server"
export const getGeneralLogEntriesFn = createServerFn({ method: "GET" }).handler(() =>
  getGeneralLogEntries(getRequestHeaders()),
)

export const getLogEntriesFn = createServerFn({ method: "GET" })
  .validator(GetLogEntriesSchema)
  .handler(({ data }) => getLogEntries(getRequestHeaders(), data))
