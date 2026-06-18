import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  CreateSubsubsectionSchema,
  DeleteSubsubsectionSchema,
  GetSubsubsectionBySlugSchema,
  GetSubsubsectionSchema,
  GetSubsubsectionsSchema,
  UpdateSubsubsectionSchema,
} from "./subsubsections.inputSchemas"
import {
  createSubsubsection,
  deleteSubsubsection,
  getSubsubsection,
  getSubsubsectionBySlug,
  getSubsubsections,
  updateSubsubsection,
} from "./subsubsections.server"
export const getSubsubsectionsFn = createServerFn({ method: "GET" })
  .validator(GetSubsubsectionsSchema)
  .handler(({ data }) => getSubsubsections(getRequestHeaders(), data))

const _getSubsubsectionFn = createServerFn({ method: "GET" })
  .validator(GetSubsubsectionSchema)
  .handler(({ data }) => getSubsubsection(getRequestHeaders(), data))

export const getSubsubsectionBySlugFn = createServerFn({ method: "GET" })
  .validator(GetSubsubsectionBySlugSchema)
  .handler(({ data }) => getSubsubsectionBySlug(getRequestHeaders(), data))

export const createSubsubsectionFn = createServerFn({ method: "POST" })
  .validator(CreateSubsubsectionSchema)
  .handler(({ data }) => createSubsubsection(getRequestHeaders(), data))

export const updateSubsubsectionFn = createServerFn({ method: "POST" })
  .validator(UpdateSubsubsectionSchema)
  .handler(({ data }) => updateSubsubsection(getRequestHeaders(), data))

export const deleteSubsubsectionFn = createServerFn({ method: "POST" })
  .validator(DeleteSubsubsectionSchema)
  .handler(({ data }) => deleteSubsubsection(getRequestHeaders(), data))
