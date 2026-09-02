import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  DeleteSubsubsectionMcpDraftSchema,
  GetSubsubsectionMcpDraftSchema,
} from "./mcpDrafts.inputSchemas"
import {
  deleteSubsubsectionMcpDraft,
  getSubsubsectionMcpDraft,
  listMcpDraftsGrouped,
} from "./mcpDrafts.server"

export const getSubsubsectionMcpDraftFn = createServerFn({ method: "GET" })
  .validator(GetSubsubsectionMcpDraftSchema)
  .handler(({ data }) => getSubsubsectionMcpDraft(getRequestHeaders(), data))

export const deleteSubsubsectionMcpDraftFn = createServerFn({ method: "POST" })
  .validator(DeleteSubsubsectionMcpDraftSchema)
  .handler(({ data }) => deleteSubsubsectionMcpDraft(getRequestHeaders(), data))

export const listMcpDraftsGroupedFn = createServerFn({ method: "GET" }).handler(() =>
  listMcpDraftsGrouped(getRequestHeaders()),
)
