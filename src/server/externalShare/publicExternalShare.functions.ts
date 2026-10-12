import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { GetPublicExternalShareSchema } from "./publicExternalShare.inputSchemas"
import { getPublicExternalShare } from "./publicExternalShare.server"

export const getPublicExternalShareFn = createServerFn({ method: "POST" })
  .validator(GetPublicExternalShareSchema)
  .handler(({ data }) => getPublicExternalShare(getRequestHeaders(), data.token))
