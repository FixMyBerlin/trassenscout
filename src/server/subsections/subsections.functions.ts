import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  CreateSubsectionSchema,
  CreateSubsectionsSchema,
  DeleteSubsectionSchema,
  GetSubsectionBySlugSchema,
  GetSubsectionSchema,
  GetSubsectionsSchema,
  UpdateSubsectionSchema,
  UpdateSubsectionsWithPlacemarkSchema,
} from "./subsections.inputSchemas"
import {
  createSubsection,
  createSubsections,
  deleteSubsection,
  getSubsection,
  getSubsectionBySlug,
  getSubsectionMaxOrder,
  getSubsections,
  updateSubsection,
  updateSubsectionsWithPlacemark,
} from "./subsections.server"
export const getSubsectionsFn = createServerFn({ method: "GET" })
  .inputValidator(GetSubsectionsSchema)
  .handler(({ data }) => getSubsections(getRequestHeaders(), data))

const _getSubsectionFn = createServerFn({ method: "GET" })
  .inputValidator(GetSubsectionSchema)
  .handler(({ data }) => getSubsection(getRequestHeaders(), data))

export const getSubsectionBySlugFn = createServerFn({ method: "GET" })
  .inputValidator(GetSubsectionBySlugSchema)
  .handler(({ data }) => getSubsectionBySlug(getRequestHeaders(), data))

export const getSubsectionMaxOrderFn = createServerFn({ method: "GET" })
  .inputValidator(GetSubsectionsSchema)
  .handler(({ data }) => getSubsectionMaxOrder(getRequestHeaders(), data))

export const createSubsectionFn = createServerFn({ method: "POST" })
  .inputValidator(CreateSubsectionSchema)
  .handler(({ data }) => createSubsection(getRequestHeaders(), data))

export const updateSubsectionFn = createServerFn({ method: "POST" })
  .inputValidator(UpdateSubsectionSchema)
  .handler(({ data }) => updateSubsection(getRequestHeaders(), data))

export const deleteSubsectionFn = createServerFn({ method: "POST" })
  .inputValidator(DeleteSubsectionSchema)
  .handler(({ data }) => deleteSubsection(getRequestHeaders(), data))

export const createSubsectionsFn = createServerFn({ method: "POST" })
  .inputValidator(CreateSubsectionsSchema)
  .handler(({ data }) => createSubsections(getRequestHeaders(), data))

export const updateSubsectionsWithPlacemarkFn = createServerFn({ method: "POST" })
  .inputValidator(UpdateSubsectionsWithPlacemarkSchema)
  .handler(({ data }) => updateSubsectionsWithPlacemark(getRequestHeaders(), data))
