import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { GetProjectLogEntriesSchema } from "./logEntries.inputSchemas"
import { getGeneralLogEntries, getProjectLogEntries } from "./logEntries.server"
export const getGeneralLogEntriesFn = createServerFn({ method: "GET" }).handler(() =>
  getGeneralLogEntries(getRequestHeaders()),
)

export const getProjectLogEntriesFn = createServerFn({ method: "GET" })
  .inputValidator(GetProjectLogEntriesSchema)
  .handler(({ data }) => getProjectLogEntries(getRequestHeaders(), data))
