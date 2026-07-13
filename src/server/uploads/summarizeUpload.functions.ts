import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { summarizeUpload } from "@/src/server/uploads/summarizeUpload.server"
import { SummarizeUploadSchema } from "./summarizeUpload.inputSchemas"
export const summarizeUploadFn = createServerFn({ method: "POST" })
  .validator(SummarizeUploadSchema)
  .handler(({ data }) => summarizeUpload(getRequestHeaders(), data))
