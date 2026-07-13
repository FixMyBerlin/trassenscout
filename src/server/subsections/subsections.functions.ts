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
  .validator(GetSubsectionsSchema)
  .handler(({ data }) => getSubsections(getRequestHeaders(), data))

const _getSubsectionFn = createServerFn({ method: "GET" })
  .validator(GetSubsectionSchema)
  .handler(({ data }) => getSubsection(getRequestHeaders(), data))

export const getSubsectionBySlugFn = createServerFn({ method: "GET" })
  .validator(GetSubsectionBySlugSchema)
  .handler(({ data }) => getSubsectionBySlug(getRequestHeaders(), data))

export const getSubsectionMaxOrderFn = createServerFn({ method: "GET" })
  .validator(GetSubsectionsSchema)
  .handler(({ data }) => getSubsectionMaxOrder(getRequestHeaders(), data))

export const createSubsectionFn = createServerFn({ method: "POST" })
  .validator(CreateSubsectionSchema)
  .handler(({ data }) => createSubsection(getRequestHeaders(), data))

export const updateSubsectionFn = createServerFn({ method: "POST" })
  .validator(UpdateSubsectionSchema)
  .handler(({ data }) => updateSubsection(getRequestHeaders(), data))

export const deleteSubsectionFn = createServerFn({ method: "POST" })
  .validator(DeleteSubsectionSchema)
  .handler(({ data }) => deleteSubsection(getRequestHeaders(), data))

export const createSubsectionsFn = createServerFn({ method: "POST" })
  .validator(CreateSubsectionsSchema)
  .handler(({ data }) => createSubsections(getRequestHeaders(), data))

export const updateSubsectionsWithPlacemarkFn = createServerFn({ method: "POST" })
  .validator(UpdateSubsectionsWithPlacemarkSchema)
  .handler(({ data }) => updateSubsectionsWithPlacemark(getRequestHeaders(), data))
