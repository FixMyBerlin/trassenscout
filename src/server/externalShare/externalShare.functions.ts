import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  GetExternalShareSchema,
  GetPublicExternalShareSchema,
  RemoveUploadFromExternalShareSchema,
  RotateExternalShareTokenSchema,
} from "./externalShare.inputSchemas"
import {
  getExternalShare,
  removeUploadFromExternalShare,
  rotateExternalShareToken,
} from "./externalShare.server"
import { getPublicExternalShare } from "./publicExternalShare.server"

export const getExternalShareFn = createServerFn({ method: "GET" })
  .validator(GetExternalShareSchema)
  .handler(({ data }) => getExternalShare(getRequestHeaders(), data))

export const rotateExternalShareTokenFn = createServerFn({ method: "POST" })
  .validator(RotateExternalShareTokenSchema)
  .handler(({ data }) => rotateExternalShareToken(getRequestHeaders(), data))

export const removeUploadFromExternalShareFn = createServerFn({ method: "POST" })
  .validator(RemoveUploadFromExternalShareSchema)
  .handler(({ data }) => removeUploadFromExternalShare(getRequestHeaders(), data))

// POST keeps the token out of query strings, where GET server functions would put it.
export const getPublicExternalShareFn = createServerFn({ method: "POST" })
  .validator(GetPublicExternalShareSchema)
  .handler(({ data }) => getPublicExternalShare(getRequestHeaders(), data.token))
