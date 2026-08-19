import { retainSearchParams, stripSearchParams } from "@tanstack/react-router"
import { z } from "zod"

const viewModeSchema = z.enum(["map", "list"])

export type ViewMode = z.infer<typeof viewModeSchema>

const VIEW_MODE_DEFAULT: ViewMode = "map"

const viewModeWithFallbackSchema = viewModeSchema.catch(VIEW_MODE_DEFAULT)

export const parseViewMode = (value: unknown): ViewMode => viewModeWithFallbackSchema.parse(value)

const viewModeSearchSchema = z.object({
  view: viewModeWithFallbackSchema.default(VIEW_MODE_DEFAULT),
})

type ViewModeSearch = z.infer<typeof viewModeSearchSchema>

export const withViewModeSearch = <TSchema extends z.ZodType>(schema: TSchema) =>
  z.intersection(schema, viewModeSearchSchema)

export const viewModeSearchMiddlewares = [
  retainSearchParams<ViewModeSearch>(["view"]),
  stripSearchParams<ViewModeSearch>({ view: VIEW_MODE_DEFAULT }),
]
