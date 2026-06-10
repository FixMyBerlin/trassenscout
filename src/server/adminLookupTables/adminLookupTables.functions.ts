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
  .inputValidator(GetLookupRowsSchema)
  .handler(({ data }) => getLookupRows(getRequestHeaders(), data))

export const getLookupRowsWithCountFn = createServerFn({ method: "GET" })
  .inputValidator(GetLookupRowsSchema)
  .handler(({ data }) => getLookupRowsWithCount(getRequestHeaders(), data))

export const getLookupRowFn = createServerFn({ method: "GET" })
  .inputValidator(GetLookupRowSchema)
  .handler(({ data }) => getLookupRow(getRequestHeaders(), data))

export const createLookupRowFn = createServerFn({ method: "POST" })
  .inputValidator(CreateLookupRowSchema)
  .handler(({ data }) => createLookupRow(getRequestHeaders(), data))

export const updateLookupRowFn = createServerFn({ method: "POST" })
  .inputValidator(UpdateLookupRowSchema)
  .handler(({ data }) => updateLookupRow(getRequestHeaders(), data))

export const deleteLookupRowFn = createServerFn({ method: "POST" })
  .inputValidator(DeleteLookupRowSchema)
  .handler(({ data }) => deleteLookupRow(getRequestHeaders(), data))
