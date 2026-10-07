import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  GetExternalShareSchema,
  RemoveUploadFromExternalShareSchema,
  RotateExternalShareTokenSchema,
} from "./externalShare.inputSchemas"
import {
  getExternalShare,
  removeUploadFromExternalShare,
  rotateExternalShareToken,
} from "./externalShare.server"

export const getExternalShareFn = createServerFn({ method: "GET" })
  .validator(GetExternalShareSchema)
  .handler(({ data }) => getExternalShare(getRequestHeaders(), data))

export const rotateExternalShareTokenFn = createServerFn({ method: "POST" })
  .validator(RotateExternalShareTokenSchema)
  .handler(({ data }) => rotateExternalShareToken(getRequestHeaders(), data))

export const removeUploadFromExternalShareFn = createServerFn({ method: "POST" })
  .validator(RemoveUploadFromExternalShareSchema)
  .handler(({ data }) => removeUploadFromExternalShare(getRequestHeaders(), data))
