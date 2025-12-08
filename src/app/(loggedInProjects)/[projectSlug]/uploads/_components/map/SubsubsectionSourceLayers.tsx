"use client"

import { layerColors } from "@/src/core/components/Map/layerColors"
import type { SelectableLinesLayerProps } from "@/src/core/components/Map/layers/SelectableLinesLayer"
import { SelectableLinesLayer } from "@/src/core/components/Map/layers/SelectableLinesLayer"
import type { SelectablePointsLayerProps } from "@/src/core/components/Map/layers/SelectablePointsLayer"
import { SelectablePointsLayer } from "@/src/core/components/Map/layers/SelectablePointsLayer"
import type { SelectablePolygonsLayerProps } from "@/src/core/components/Map/layers/SelectablePolygonsLayer"
import { SelectablePolygonsLayer } from "@/src/core/components/Map/layers/SelectablePolygonsLayer"
import { lineStringToGeoJSON } from "@/src/core/components/Map/utils/lineStringToGeoJSON"
import { pointToGeoJSON } from "@/src/core/components/Map/utils/pointToGeoJSON"
import { polygonToGeoJSON } from "@/src/core/components/Map/utils/polygonToGeoJSON"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useTrySlug } from "@/src/core/routes/useSlug"
import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import { useQuery } from "@blitzjs/rpc"
import { featureCollection } from "@turf/helpers"

export const SubsubsectionSourceLayers = () => {
  const projectSlug = useProjectSlug()
  const subsectionSlug = useTrySlug("subsectionSlug")
  const subsubsectionSlug = useTrySlug("subsubsectionSlug")

  const [subsubsection] = useQuery(
    getSubsubsection,
    { projectSlug, subsectionSlug: subsectionSlug!, subsubsectionSlug: subsubsectionSlug! },
    { enabled: Boolean(subsectionSlug && subsubsectionSlug) },
  )

  if (!subsubsection) return null

  const selectableLines: SelectableLinesLayerProps["selectableLines"] =
    subsubsection.geometry.type === "LineString" ||
    subsubsection.geometry.type === "MultiLineString"
      ? featureCollection(
          lineStringToGeoJSON(subsubsection.geometry, {
            subsectionSlug: subsubsection.subsection.slug,
            subsubsectionSlug: subsubsection.slug,
            color: layerColors.selectable,
          }),
        )
      : featureCollection([])

  const selectablePoints: SelectablePointsLayerProps["selectablePoints"] =
    subsubsection.geometry.type === "Point" || subsubsection.geometry.type === "MultiPoint"
      ? featureCollection(
          pointToGeoJSON(subsubsection.geometry, {
            subsectionSlug: subsubsection.subsection.slug,
            subsubsectionSlug: subsubsection.slug,
            color: layerColors.selectable,
            opacity: 0.3,
            radius: 10,
            "border-width": 3,
            "border-color": layerColors.selectable,
          }),
        )
      : featureCollection([])

  const selectablePolygons: SelectablePolygonsLayerProps["selectablePolygons"] =
    subsubsection.geometry.type === "Polygon" || subsubsection.geometry.type === "MultiPolygon"
      ? featureCollection(
          polygonToGeoJSON(subsubsection.geometry, {
            subsectionSlug: subsubsection.subsection.slug,
            subsubsectionSlug: subsubsection.slug,
            color: layerColors.selectable,
          }),
        )
      : featureCollection([])

  return (
    <>
      <SelectableLinesLayer selectableLines={selectableLines} layerIdSuffix="_subsubsection" />
      <SelectablePointsLayer selectablePoints={selectablePoints} layerIdSuffix="_subsubsection" />
      <SelectablePolygonsLayer
        selectablePolygons={selectablePolygons}
        layerIdSuffix="_subsubsection"
      />
    </>
  )
}
