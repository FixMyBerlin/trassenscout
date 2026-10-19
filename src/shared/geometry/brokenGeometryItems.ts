import { GeometryWithTypeSchema } from "@/src/shared/geometry/geometrySchemas"
import { isRenderableGeometry } from "@/src/shared/geometry/isRenderableGeometry"

/**
 * Whether a stored entry can be drawn.
 *
 * When the entry carries a `type` column, the geometry has to match it: a Point stored on a LINE
 * Planungsabschnitt draws nothing, so it counts as broken rather than silently disappearing.
 */
export const isRenderableEntry = (entry: { geometry: unknown; type?: unknown }) =>
  entry.type === undefined
    ? isRenderableGeometry(entry.geometry)
    : GeometryWithTypeSchema.safeParse({ type: entry.type, geometry: entry.geometry }).success

const isWithoutGeometry = (entry: { geometry: unknown; type?: unknown }) =>
  entry.type === null && entry.geometry === null

/** The entries a page must keep off its map — pass the result straight to the notice. */
export const brokenGeometryItems = <
  T extends { id: number; slug: string; geometry: unknown; type?: unknown },
>(
  items: T[],
) => items.filter((item) => !isWithoutGeometry(item) && !isRenderableEntry(item))
