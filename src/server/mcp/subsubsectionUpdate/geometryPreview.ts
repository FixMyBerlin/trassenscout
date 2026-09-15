export const MCP_GEOMETRY_MAX_VERTICES = 5000
export const MCP_GEOMETRY_WARN_VERTICES = 1000

type LngLat = [number, number]

function isLngLat(value: unknown): value is LngLat {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  )
}

function walkCoordinates(value: unknown, visit: (position: LngLat) => void) {
  if (isLngLat(value)) {
    visit(value)
    return
  }
  if (!Array.isArray(value)) return
  for (const item of value) walkCoordinates(item, visit)
}

export function countGeometryVertices(geometry: { coordinates?: unknown } | null | undefined) {
  if (!geometry) return 0
  let count = 0
  walkCoordinates(geometry.coordinates, () => {
    count += 1
  })
  return count
}

export function geometryPreview(geometry: { type: string; coordinates?: unknown }) {
  const vertexCount = countGeometryVertices(geometry)
  let minLng = Number.POSITIVE_INFINITY
  let minLat = Number.POSITIVE_INFINITY
  let maxLng = Number.NEGATIVE_INFINITY
  let maxLat = Number.NEGATIVE_INFINITY
  walkCoordinates(geometry.coordinates, ([lng, lat]) => {
    minLng = Math.min(minLng, lng)
    minLat = Math.min(minLat, lat)
    maxLng = Math.max(maxLng, lng)
    maxLat = Math.max(maxLat, lat)
  })
  const bbox =
    vertexCount === 0
      ? null
      : ([minLng, minLat, maxLng, maxLat] as [number, number, number, number])
  return { type: geometry.type, vertexCount, bbox }
}
