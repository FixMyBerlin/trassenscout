import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { CreateTagSchema, GetTagsSchema, TagIdSchema, UpdateTagSchema } from "./tags.inputSchemas"
import {
  archiveTag,
  createTag,
  deleteTag,
  getTagsByProject,
  getTagsWithUsageCount,
  unarchiveTag,
  updateTag,
} from "./tags.server"

export const getTagsByProjectFn = createServerFn({ method: "GET" })
  .validator(GetTagsSchema)
  .handler(({ data }) => getTagsByProject(getRequestHeaders(), data))

export const getTagsWithUsageCountFn = createServerFn({ method: "GET" })
  .validator(GetTagsSchema)
  .handler(({ data }) => getTagsWithUsageCount(getRequestHeaders(), data))

export const createTagFn = createServerFn({ method: "POST" })
  .validator(CreateTagSchema)
  .handler(({ data }) => createTag(getRequestHeaders(), data))

export const updateTagFn = createServerFn({ method: "POST" })
  .validator(UpdateTagSchema)
  .handler(({ data }) => updateTag(getRequestHeaders(), data))

export const archiveTagFn = createServerFn({ method: "POST" })
  .validator(TagIdSchema)
  .handler(({ data }) => archiveTag(getRequestHeaders(), data))

export const unarchiveTagFn = createServerFn({ method: "POST" })
  .validator(TagIdSchema)
  .handler(({ data }) => unarchiveTag(getRequestHeaders(), data))

export const deleteTagFn = createServerFn({ method: "POST" })
  .validator(TagIdSchema)
  .handler(({ data }) => deleteTag(getRequestHeaders(), data))
