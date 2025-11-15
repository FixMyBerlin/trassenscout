"use client"

import { layerColors } from "@/src/core/components/Map/layerColors"
import { lineStringToGeoJSON } from "@/src/core/components/Map/utils/lineStringToGeoJSON"
import { pointToGeoJSON } from "@/src/core/components/Map/utils/pointToGeoJSON"
import { polygonToGeoJSON } from "@/src/core/components/Map/utils/polygonToGeoJSON"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useTrySlug } from "@/src/core/routes/useSlug"
import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import { useQuery } from "@blitzjs/rpc"
import { featureCollection } from "@turf/helpers"
import { useMemo } from "react"
import { Layer, Source } from "react-map-gl/maplibre"

const selectableLineLayerId = "layer_selectable_line_features_subsubsection"
const selectablePointLayerId = "layer_selectable_point_features_subsubsection"
const selectablePolygonLayerId = "layer_selectable_polygon_features_subsubsection"

export const SubsubsectionSourceLayers = () => {
  const projectSlug = useProjectSlug()
  const subsectionSlug = useTrySlug("subsectionSlug")
  const subsubsectionSlug = useTrySlug("subsubsectionSlug")

  const [subsubsection] = useQuery(
    getSubsubsection,
    {
      projectSlug,
      subsectionSlug: subsectionSlug!,
      subsubsectionSlug: subsubsectionSlug!,
    },
    { enabled: Boolean(subsectionSlug && subsubsectionSlug) },
  )

  const selectableLines = useMemo(() => {
    if (!subsubsection || subsubsection.type !== "LINE") return featureCollection([])

    const properties = {
      subsectionSlug: subsubsection.subsection.slug,
      subsubsectionSlug: subsubsection.slug,
      color: layerColors.selectable,
    }
    const features =
      lineStringToGeoJSON<typeof properties>(subsubsection.geometry, properties) ?? []
    return featureCollection(features)
  }, [subsubsection])

  const selectablePoints = useMemo(() => {
    if (!subsubsection || subsubsection.type !== "POINT") return featureCollection([])

    const properties = {
      subsectionSlug: subsubsection.subsection.slug,
      subsubsectionSlug: subsubsection.slug,
      color: layerColors.selectable,
      opacity: 0.3,
      radius: 10,
      "border-width": 3,
      "border-color": layerColors.selectable,
    }
    const feature = pointToGeoJSON<typeof properties>(subsubsection.geometry, properties)
    return feature ? featureCollection([feature]) : featureCollection([])
  }, [subsubsection])

  const selectablePolygons = useMemo(() => {
    if (!subsubsection || subsubsection.type !== "POLYGON") return featureCollection([])

    const properties = {
      subsectionSlug: subsubsection.subsection.slug,
      subsubsectionSlug: subsubsection.slug,
      color: layerColors.selectable,
    }
    const features = polygonToGeoJSON<typeof properties>(subsubsection.geometry, properties) ?? []
    return featureCollection(features)
  }, [subsubsection])

  if (!subsubsection) return null

  return (
    <>
      {selectableLines.features.length > 0 && (
        <Source id={selectableLineLayerId} type="geojson" data={selectableLines}>
          <Layer
            id={`${selectableLineLayerId}-outline`}
            type="line"
            layout={{
              "line-cap": "round",
              "line-join": "round",
            }}
            paint={{
              "line-width": 9,
              "line-color": layerColors.dot,
              "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 0.6],
            }}
          />
          <Layer
            id={`${selectableLineLayerId}-solid`}
            type="line"
            layout={{
              "line-cap": "round",
              "line-join": "round",
            }}
            paint={{
              "line-width": 7,
              "line-color": ["case", ["has", "color"], ["get", "color"], "black"],
              "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 1],
            }}
          />
        </Source>
      )}
      {selectablePoints.features.length > 0 && (
        <Source id={selectablePointLayerId} type="geojson" data={selectablePoints}>
          <Layer
            id={selectablePointLayerId}
            type="circle"
            paint={{
              "circle-radius": ["case", ["has", "radius"], ["get", "radius"], 17],
              "circle-color": ["case", ["has", "color"], ["get", "color"], "black"],
              "circle-stroke-width": ["case", ["has", "border-width"], ["get", "border-width"], 0],
              "circle-stroke-color": [
                "case",
                ["has", "border-color"],
                ["get", "border-color"],
                "transparent",
              ],
              "circle-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 1],
            }}
          />
        </Source>
      )}
      {selectablePolygons.features.length > 0 && (
        <Source id={selectablePolygonLayerId} type="geojson" data={selectablePolygons}>
          <Layer
            id={`${selectablePolygonLayerId}-fill`}
            type="fill"
            paint={{
              "fill-color": ["case", ["has", "color"], ["get", "color"], "black"],
              "fill-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 0.3],
            }}
          />
          <Layer
            id={`${selectablePolygonLayerId}-outline`}
            type="line"
            layout={{
              "line-cap": "round",
              "line-join": "round",
            }}
            paint={{
              "line-width": 3,
              "line-color": ["case", ["has", "color"], ["get", "color"], "black"],
              "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 1],
            }}
          />
        </Source>
      )}
    </>
  )
}
