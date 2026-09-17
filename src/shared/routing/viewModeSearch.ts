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

/** A factory, not a constant: the middleware is typed for the whole search of its route. */
export const viewModeSearchMiddlewares = <TSearch extends ViewModeSearch>() => [
  retainSearchParams<TSearch>(["view"]),
  stripSearchParams<TSearch>({ view: VIEW_MODE_DEFAULT } as Partial<TSearch>),
]
