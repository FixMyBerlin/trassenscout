import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { GetSystemLogEntriesSchema } from "@/src/shared/systemLogEntries/searchSchemas"
import { getSystemLogEntries } from "./systemLogEntries.server"

export const getSystemLogEntriesFn = createServerFn({ method: "GET" })
  .validator(GetSystemLogEntriesSchema)
  .handler(({ data }) => getSystemLogEntries(getRequestHeaders(), data))
