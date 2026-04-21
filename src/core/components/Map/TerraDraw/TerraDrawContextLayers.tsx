import { acquisitionAreaColors } from "@/src/core/components/Map/colors/acquisitionAreaColors"
import {
  acquisitionAreaParcelFillPaint,
  acquisitionAreaParcelLineBasePaint,
  acquisitionAreaParcelLineDashPaint,
} from "@/src/core/components/Map/colors/acquisitionAreaParcelLayerStyles"
import { LineEndPointsLayer } from "@/src/core/components/Map/layers/LineEndPointsLayer"
import { SubsectionHullsLayer } from "@/src/core/components/Map/layers/SubsectionHullsLayer"
import {
  UnifiedFeaturesLayer,
  type UnifiedFeatureProperties,
} from "@/src/core/components/Map/layers/UnifiedFeaturesLayer"
import { getSubsectionFeatures } from "@/src/core/components/Map/utils/getSubsectionFeatures"
import { getSubsubsectionFeatures } from "@/src/core/components/Map/utils/getSubsubsectionFeatures"
import { mergeFeatureCollections } from "@/src/core/components/Map/utils/mergeFeatureCollections"
import { TSubsections } from "@/src/server/subsections/queries/getSubsections"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { feature, featureCollection } from "@turf/helpers"
import type { FeatureCollection, Geometry, MultiPolygon, Polygon } from "geojson"
import { useMemo } from "react"
import { Layer, Source } from "react-map-gl/maplibre"

type GeometryDrawingSubsectionContextLayersProps = {
  subsections: TSubsections
  selectedSubsectionSlug: string
}

// Context layers for subsection-only editing in the geometry drawing map.
// Shows subsection hulls with the current subsection filtered out (so TerraDraw-drawn geometry is not doubled).
export const GeometryDrawingSubsectionContextLayers = ({
  subsections,
  selectedSubsectionSlug,
}: GeometryDrawingSubsectionContextLayersProps) => {
  // Subsection features: same as SubsectionSubsubsectionMap (all subsections, isCurrent for selected)
  const subsectionFeatures = useMemo(() => {
    return getSubsectionFeatures({
      subsections,
      highlight: "currentSubsection",
      selectedSubsectionSlug,
    })
  }, [subsections, selectedSubsectionSlug])

  // Subsection hull input: filter out current subsection (it's drawn by TerraDraw)
  // Only "other" subsections are shown; they all get the "other" color. No double-draw of current.
  const subsectionHullFeatures = useMemo(() => {
    return {
      lines: {
        ...subsectionFeatures.lines,
        features: subsectionFeatures.lines.features.filter((f) => !f.properties.isCurrent),
      },
      polygons: {
        ...subsectionFeatures.polygons,
        features: subsectionFeatures.polygons.features.filter((f) => !f.properties.isCurrent),
      },
    }
  }, [subsectionFeatures])

  return (
    <SubsectionHullsLayer
      lines={subsectionHullFeatures.lines}
      polygons={subsectionHullFeatures.polygons}
      layerIdSuffix="_terra_draw_subsection"
    />
  )
}

type GeometryDrawingSubsubsectionContextLayersProps = {
  subsections: TSubsections
  selectedSubsectionSlug: string
  subsubsections: SubsubsectionWithPosition[]
  selectedSubsubsectionSlug?: string
}

// Context layers for subsubsection editing in the geometry drawing map.
// Shows subsection hulls (all, two-color) plus "other" subsubsection lines/polygons/points/lineEndPoints.
export const GeometryDrawingSubsubsectionContextLayers = ({
  subsections,
  selectedSubsectionSlug,
  subsubsections,
  selectedSubsubsectionSlug,
}: GeometryDrawingSubsubsectionContextLayersProps) => {
  // Subsection features: all subsections, isCurrent for selected
  const subsectionFeatures = useMemo(() => {
    return getSubsectionFeatures({
      subsections,
      highlight: "currentSubsection",
      selectedSubsectionSlug,
    })
  }, [subsections, selectedSubsectionSlug])

  // Subsection hulls: pass all subsections; hull layer styles by isCurrent (two colors)
  const subsectionHullFeatures = useMemo(() => {
    return { lines: subsectionFeatures.lines, polygons: subsectionFeatures.polygons }
  }, [subsectionFeatures])

  // Other subsubsection features: filter to "other" entries only (same idea as presentational map)
  const otherSubsubsectionFeatures = useMemo(() => {
    const allFeatures = getSubsubsectionFeatures({
      subsubsections,
      selectedSubsubsectionSlug: selectedSubsubsectionSlug ?? null,
    })
    const filteredLines = {
      ...allFeatures.lines,
      features: allFeatures.lines.features.filter((f) => !f.properties.isCurrent),
    }
    const filteredPolygons = {
      ...allFeatures.polygons,
      features: allFeatures.polygons.features.filter((f) => !f.properties.isCurrent),
    }
    const filteredPoints = {
      ...allFeatures.points,
      features: allFeatures.points.features.filter((f) => !f.properties.isCurrent),
    }
    const filteredLineEndPoints = {
      ...allFeatures.lineEndPoints,
      features: allFeatures.lineEndPoints.features.filter((f) => !f.properties.isCurrent),
    }
    return {
      lines: filteredLines.features.length > 0 ? filteredLines : undefined,
      polygons: filteredPolygons.features.length > 0 ? filteredPolygons : undefined,
      points: filteredPoints.features.length > 0 ? filteredPoints : undefined,
      lineEndPoints: filteredLineEndPoints.features.length > 0 ? filteredLineEndPoints : undefined,
    }
  }, [subsubsections, selectedSubsubsectionSlug])

  // Merge filtered lines, polygons, and points into unified features
  const unifiedOtherFeatures = useMemo(
    () =>
      mergeFeatureCollections<UnifiedFeatureProperties>(
        otherSubsubsectionFeatures.lines,
        otherSubsubsectionFeatures.polygons,
        otherSubsubsectionFeatures.points,
      ),
    [
      otherSubsubsectionFeatures.lines,
      otherSubsubsectionFeatures.polygons,
      otherSubsubsectionFeatures.points,
    ],
  )

  return (
    <>
      <SubsectionHullsLayer
        lines={subsectionHullFeatures.lines}
        polygons={subsectionHullFeatures.polygons}
        layerIdSuffix="_terra_draw_subsection"
      />
      {unifiedOtherFeatures && (
        <UnifiedFeaturesLayer
          features={unifiedOtherFeatures}
          layerIdSuffix="_terra_draw_other_subsubsection"
          interactive={false}
          colorSchema="subsubsection"
        />
      )}
      {otherSubsubsectionFeatures?.lineEndPoints && (
        <LineEndPointsLayer
          lineEndPoints={otherSubsubsectionFeatures.lineEndPoints}
          layerIdSuffix="_terra_draw_other_subsubsection"
          colorSchema="subsubsection"
        />
      )}
    </>
  )
}

type GeometryDrawingAcquisitionAreaParcelContextLayersProps = {
  parcelGeometry: Polygon | MultiPolygon
}

function singleGeometryFeatureCollection<T extends Geometry>(
  geometry: T,
): FeatureCollection<T, null> {
  return featureCollection([feature(geometry, null)]) as FeatureCollection<T, null>
}

export const GeometryDrawingAcquisitionAreaParcelContextLayers = ({
  parcelGeometry,
}: GeometryDrawingAcquisitionAreaParcelContextLayersProps) => {
  const parcelFeatureCollection = useMemo(
    () => singleGeometryFeatureCollection(parcelGeometry),
    [parcelGeometry],
  )

  return (
    <>
      <Source
        id="terra_draw_acquisition_area_parcel"
        type="geojson"
        data={parcelFeatureCollection}
      />
      <Layer
        id="terra_draw_acquisition_area_parcel_fill"
        source="terra_draw_acquisition_area_parcel"
        type="fill"
        paint={acquisitionAreaParcelFillPaint}
      />
      <Layer
        id="terra_draw_acquisition_area_parcel_line_base"
        source="terra_draw_acquisition_area_parcel"
        type="line"
        paint={acquisitionAreaParcelLineBasePaint}
      />
      <Layer
        id="terra_draw_acquisition_area_parcel_line_dash"
        source="terra_draw_acquisition_area_parcel"
        type="line"
        paint={acquisitionAreaParcelLineDashPaint}
      />
    </>
  )
}

type GeometryDrawingAcquisitionAreaPreviewLayersProps = {
  geometry: Polygon | MultiPolygon
}

export const GeometryDrawingAcquisitionAreaPreviewLayers = ({
  geometry,
}: GeometryDrawingAcquisitionAreaPreviewLayersProps) => {
  const previewFeatureCollection = useMemo(
    () => singleGeometryFeatureCollection(geometry),
    [geometry],
  )

  return (
    <>
      <Source
        id="terra_draw_acquisition_area_preview"
        type="geojson"
        data={previewFeatureCollection}
      />
      <Layer
        id="terra_draw_acquisition_area_preview_fill"
        source="terra_draw_acquisition_area_preview"
        type="fill"
        paint={{
          "fill-color": acquisitionAreaColors.negotiationAreaEdit,
          "fill-opacity": 0.22,
        }}
      />
      <Layer
        id="terra_draw_acquisition_area_preview_outline"
        source="terra_draw_acquisition_area_preview"
        type="line"
        paint={{
          "line-color": acquisitionAreaColors.negotiationAreaEdit,
          "line-width": 3,
          "line-opacity": 0.95,
        }}
      />
    </>
  )
}
