import type { LineString, MultiLineString } from "geojson"

type Dot = [number, number]

export const extractLineEndpoints = (geometry: LineString | MultiLineString) => {
  switch (geometry.type) {
    case "LineString": {
      const coords = geometry.coordinates
      if (!coords || coords.length === 0) return []
      return [coords[0] as Dot, coords[coords.length - 1] as Dot]
    }
    case "MultiLineString": {
      return geometry.coordinates.flatMap((line) => {
        if (!line || line.length === 0) return []
        return [line[0] as Dot, line[line.length - 1] as Dot]
      })
    }
  }
}
