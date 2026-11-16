import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import {
  GetMyBookmarkedSubsubsectionsSchema,
  GetSubsubsectionBookmarkSchema,
  SetSubsubsectionBookmarkSchema,
} from "./subsubsectionBookmarks.inputSchemas"
import {
  getMyBookmarkedSubsubsections,
  getSubsubsectionBookmark,
  setSubsubsectionBookmark,
} from "./subsubsectionBookmarks.server"

export const getMyBookmarkedSubsubsectionsFn = createServerFn({ method: "GET" })
  .validator(GetMyBookmarkedSubsubsectionsSchema)
  .handler(({ data }) => getMyBookmarkedSubsubsections(getRequestHeaders(), data))

export const getSubsubsectionBookmarkFn = createServerFn({ method: "GET" })
  .validator(GetSubsubsectionBookmarkSchema)
  .handler(({ data }) => getSubsubsectionBookmark(getRequestHeaders(), data))

export const setSubsubsectionBookmarkFn = createServerFn({ method: "POST" })
  .validator(SetSubsubsectionBookmarkSchema)
  .handler(({ data }) => setSubsubsectionBookmark(getRequestHeaders(), data))
