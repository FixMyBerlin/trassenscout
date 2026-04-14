import { subsubsectionColors } from "@/src/core/components/Map/colors/subsubsectionColors"
import { LineEndPointsLayer } from "@/src/core/components/Map/layers/LineEndPointsLayer"
import { SubsectionHullsLayer } from "@/src/core/components/Map/layers/SubsectionHullsLayer"
import {
  UnifiedFeaturesLayer,
  type UnifiedFeatureProperties,
} from "@/src/core/components/Map/layers/UnifiedFeaturesLayer"
import { computeBufferPolygonFeature } from "@/src/core/components/Map/utils/computeBufferPolygonFeature"
import { getSubsectionFeatures } from "@/src/core/components/Map/utils/getSubsectionFeatures"
import { getSubsubsectionFeatures } from "@/src/core/components/Map/utils/getSubsubsectionFeatures"
import { mergeFeatureCollections } from "@/src/core/components/Map/utils/mergeFeatureCollections"
import { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { TSubsections } from "@/src/server/subsections/queries/getSubsections"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
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

type GeometryDrawingDealAreaParcelContextLayersProps = {
  parcelGeometry: Polygon | MultiPolygon
}

function singleGeometryFeatureCollection<T extends Geometry>(
  geometry: T,
): FeatureCollection<T, null> {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry,
        properties: null,
      },
    ],
  }
}

export const GeometryDrawingDealAreaParcelContextLayers = ({
  parcelGeometry,
}: GeometryDrawingDealAreaParcelContextLayersProps) => {
  const parcelFeatureCollection = useMemo(
    () => singleGeometryFeatureCollection(parcelGeometry),
    [parcelGeometry],
  )

  return (
    <Source id="terra_draw_deal_area_parcel" type="geojson" data={parcelFeatureCollection}>
      <Layer
        id="terra_draw_deal_area_parcel_fill"
        type="fill"
        paint={{
          "fill-color": "#38BDF8",
          "fill-opacity": 0.08,
        }}
      />
      <Layer
        id="terra_draw_deal_area_parcel_outline"
        type="line"
        paint={{
          "line-color": "#2C62A9",
          "line-width": 3,
          "line-opacity": 0.95,
          "line-dasharray": [2, 1],
        }}
      />
    </Source>
  )
}

type GeometryDrawingDealAreaSubsubsectionContextLayersProps = {
  geometry: SupportedGeometry
}

const DEAL_AREA_EDIT_BUFFER_RADIUS_METERS = 20

export const GeometryDrawingDealAreaSubsubsectionContextLayers = ({
  geometry,
}: GeometryDrawingDealAreaSubsubsectionContextLayersProps) => {
  const subsubsectionFeatureCollection = useMemo(
    () => singleGeometryFeatureCollection(geometry),
    [geometry],
  )

  const bufferOutlineFeatureCollection = useMemo(() => {
    const bufferedGeometry = computeBufferPolygonFeature(
      geometry,
      DEAL_AREA_EDIT_BUFFER_RADIUS_METERS,
    )

    if (!bufferedGeometry?.geometry) {
      return { type: "FeatureCollection" as const, features: [] }
    }

    return singleGeometryFeatureCollection(bufferedGeometry.geometry)
  }, [geometry])

  return (
    <>
      <Source
        id="terra_draw_deal_area_subsubsection"
        type="geojson"
        data={subsubsectionFeatureCollection}
      >
        <Layer
          id="terra_draw_deal_area_subsubsection_fill"
          type="fill"
          paint={{
            "fill-color": subsubsectionColors.polygon.unselected,
            "fill-opacity": 0.12,
          }}
        />
        <Layer
          id="terra_draw_deal_area_subsubsection_line"
          type="line"
          paint={{
            "line-color": subsubsectionColors.line.unselected,
            "line-width": 2,
            "line-opacity": 0.7,
          }}
        />
        <Layer
          id="terra_draw_deal_area_subsubsection_point"
          type="circle"
          paint={{
            "circle-radius": 6,
            "circle-color": subsubsectionColors.point.default,
            "circle-stroke-width": 1,
            "circle-stroke-color": subsubsectionColors.line.borderColor,
          }}
        />
      </Source>
      <Source
        id="terra_draw_deal_area_subsubsection_buffer"
        type="geojson"
        data={bufferOutlineFeatureCollection}
      >
        <Layer
          id="terra_draw_deal_area_subsubsection_buffer"
          type="line"
          paint={{
            "line-color": "#2563eb",
            "line-opacity": 0.5,
            "line-width": 2,
            "line-dasharray": [6, 3],
          }}
        />
      </Source>
    </>
  )
}

type GeometryDrawingDealAreaPreviewLayersProps = {
  geometry: Polygon | MultiPolygon
}

export const GeometryDrawingDealAreaPreviewLayers = ({
  geometry,
}: GeometryDrawingDealAreaPreviewLayersProps) => {
  const previewFeatureCollection = useMemo(
    () => singleGeometryFeatureCollection(geometry),
    [geometry],
  )

  return (
    <Source id="terra_draw_deal_area_preview" type="geojson" data={previewFeatureCollection}>
      <Layer
        id="terra_draw_deal_area_preview_fill"
        type="fill"
        paint={{
          "fill-color": "#DC2626",
          "fill-opacity": 0.22,
        }}
      />
      <Layer
        id="terra_draw_deal_area_preview_outline"
        type="line"
        paint={{
          "line-color": "#DC2626",
          "line-width": 3,
          "line-opacity": 0.95,
        }}
      />
    </Source>
  )
}
