import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  CreateLookupRowSchema,
  DeleteLookupRowSchema,
  GetLookupRowSchema,
  GetLookupRowsSchema,
  UpdateLookupRowSchema,
} from "./adminLookupTables.inputSchemas"
import {
  createLookupRow,
  deleteLookupRow,
  getLookupRow,
  getLookupRows,
  getLookupRowsWithCount,
  updateLookupRow,
} from "./adminLookupTables.server"
export const getLookupRowsFn = createServerFn({ method: "GET" })
  .validator(GetLookupRowsSchema)
  .handler(({ data }) => getLookupRows(getRequestHeaders(), data))

export const getLookupRowsWithCountFn = createServerFn({ method: "GET" })
  .validator(GetLookupRowsSchema)
  .handler(({ data }) => getLookupRowsWithCount(getRequestHeaders(), data))

export const getLookupRowFn = createServerFn({ method: "GET" })
  .validator(GetLookupRowSchema)
  .handler(({ data }) => getLookupRow(getRequestHeaders(), data))

export const createLookupRowFn = createServerFn({ method: "POST" })
  .validator(CreateLookupRowSchema)
  .handler(({ data }) => createLookupRow(getRequestHeaders(), data))

export const updateLookupRowFn = createServerFn({ method: "POST" })
  .validator(UpdateLookupRowSchema)
  .handler(({ data }) => updateLookupRow(getRequestHeaders(), data))

export const deleteLookupRowFn = createServerFn({ method: "POST" })
  .validator(DeleteLookupRowSchema)
  .handler(({ data }) => deleteLookupRow(getRequestHeaders(), data))
