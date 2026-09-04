import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  DeleteMcpDraftSchema,
  GetSubsectionMcpDraftSchema,
  GetSubsubsectionMcpDraftSchema,
  ListProjectSubsectionMcpCreateDraftsSchema,
  ListSubsectionMcpCreateDraftsSchema,
} from "./mcpDrafts.inputSchemas"
import {
  deleteMcpDraft,
  getSubsectionMcpDraft,
  getSubsubsectionMcpDraft,
  listMcpDraftsGrouped,
  listProjectSubsectionMcpCreateDrafts,
  listSubsectionMcpCreateDrafts,
} from "./mcpDrafts.server"

export const getSubsubsectionMcpDraftFn = createServerFn({ method: "GET" })
  .validator(GetSubsubsectionMcpDraftSchema)
  .handler(({ data }) => getSubsubsectionMcpDraft(getRequestHeaders(), data))

export const deleteMcpDraftFn = createServerFn({ method: "POST" })
  .validator(DeleteMcpDraftSchema)
  .handler(({ data }) => deleteMcpDraft(getRequestHeaders(), data))

export const getSubsectionMcpDraftFn = createServerFn({ method: "GET" })
  .validator(GetSubsectionMcpDraftSchema)
  .handler(({ data }) => getSubsectionMcpDraft(getRequestHeaders(), data))

export const listSubsectionMcpCreateDraftsFn = createServerFn({ method: "GET" })
  .validator(ListSubsectionMcpCreateDraftsSchema)
  .handler(({ data }) => listSubsectionMcpCreateDrafts(getRequestHeaders(), data))

export const listProjectSubsectionMcpCreateDraftsFn = createServerFn({ method: "GET" })
  .validator(ListProjectSubsectionMcpCreateDraftsSchema)
  .handler(({ data }) => listProjectSubsectionMcpCreateDrafts(getRequestHeaders(), data))

export const listMcpDraftsGroupedFn = createServerFn({ method: "GET" }).handler(() =>
  listMcpDraftsGrouped(getRequestHeaders()),
)
