import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { reprocessProjectRecord } from "@/src/server/projectRecords/reprocessProjectRecord.server"
import { ReprocessProjectRecordSchema } from "./reprocessProjectRecord.inputSchemas"
export const reprocessProjectRecordFn = createServerFn({ method: "POST" })
  .validator(ReprocessProjectRecordSchema)
  .handler(({ data }) => reprocessProjectRecord(getRequestHeaders(), data))
