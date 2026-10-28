import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import {
  createProjectRecordFromEmail,
  discardProjectRecordEmail,
  draftProjectRecordFromEmail,
  getProjectRecordEmailInbox,
  getProjectRecordEmailInboxItem,
} from "./projectRecordEmailInbox.server"
import {
  CreateProjectRecordFromEmailSchema,
  DraftProjectRecordFromEmailSchema,
  ProjectRecordEmailInboxItemSchema,
} from "./projectRecordEmails.inputSchemas"

export const getProjectRecordEmailInboxFn = createServerFn({ method: "GET" })
  .validator(ProjectSlugRequiredSchema)
  .handler(({ data }) => getProjectRecordEmailInbox(getRequestHeaders(), data))

export const getProjectRecordEmailInboxItemFn = createServerFn({ method: "GET" })
  .validator(ProjectRecordEmailInboxItemSchema)
  .handler(({ data }) => getProjectRecordEmailInboxItem(getRequestHeaders(), data))

export const draftProjectRecordFromEmailFn = createServerFn({ method: "POST" })
  .validator(DraftProjectRecordFromEmailSchema)
  .handler(({ data }) => draftProjectRecordFromEmail(getRequestHeaders(), data))

export const createProjectRecordFromEmailFn = createServerFn({ method: "POST" })
  .validator(CreateProjectRecordFromEmailSchema)
  .handler(({ data }) => createProjectRecordFromEmail(getRequestHeaders(), data))

export const discardProjectRecordEmailFn = createServerFn({ method: "POST" })
  .validator(ProjectRecordEmailInboxItemSchema)
  .handler(({ data }) => discardProjectRecordEmail(getRequestHeaders(), data))
