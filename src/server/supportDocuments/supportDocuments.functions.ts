import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  CreateSupportDocumentSchema,
  DeleteSupportDocumentSchema,
  GetSupportDocumentSchema,
  GetSupportDocumentsSchema,
  UpdateSupportDocumentSchema,
} from "./supportDocuments.inputSchemas"
import {
  createSupportDocument,
  deleteSupportDocument,
  getSupportDocument,
  getSupportDocuments,
  updateSupportDocument,
} from "./supportDocuments.server"
export const getSupportDocumentsFn = createServerFn({ method: "GET" })
  .validator(GetSupportDocumentsSchema)
  .handler(() => getSupportDocuments(getRequestHeaders()))

export const getSupportDocumentFn = createServerFn({ method: "GET" })
  .validator(GetSupportDocumentSchema)
  .handler(({ data }) => getSupportDocument(getRequestHeaders(), data))

export const createSupportDocumentFn = createServerFn({ method: "POST" })
  .validator(CreateSupportDocumentSchema)
  .handler(({ data }) => createSupportDocument(getRequestHeaders(), data))

export const updateSupportDocumentFn = createServerFn({ method: "POST" })
  .validator(UpdateSupportDocumentSchema)
  .handler(({ data }) => updateSupportDocument(getRequestHeaders(), data))

export const deleteSupportDocumentFn = createServerFn({ method: "POST" })
  .validator(DeleteSupportDocumentSchema)
  .handler(({ data }) => deleteSupportDocument(getRequestHeaders(), data))
