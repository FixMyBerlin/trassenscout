"use client"

import {
  acquisitionAreaParcelFillPaint,
  acquisitionAreaParcelLineDashPaint,
} from "@/src/core/components/Map/colors/acquisitionAreaParcelLayerStyles"
import {
  alkisAttributionToHtml,
  useAlkisAttribution,
} from "@/src/core/components/Map/useAlkisAttribution"
import type { AlkisWfsParcelProperties } from "@/src/server/alkis/alkisWfsParcelGeoJsonTypes"
import type { FeatureCollection, GeoJsonProperties, Geometry } from "geojson"
import type { ExpressionSpecification } from "maplibre-gl"
import { Layer, Source } from "react-map-gl/maplibre"

const ACQUISITION_SOURCE_IDS = {
  alkisParcels: "alkis-parcels",
  bufferOutline: "acquisition-buffer-outline",
  potentialAreas: "potential-acquisition-areas",
} as const

/** GeoJSON source id for potential acquisition polygons (used with setFeatureState). */
export const ACQUISITION_POTENTIAL_AREAS_SOURCE_ID = ACQUISITION_SOURCE_IDS.potentialAreas

/**
 * Layer IDs used for hit-testing (mirrors {@link getUnifiedClickTargetLayerIds}).
 */
export function getAcquisitionClickTargetLayerIds() {
  const id = ACQUISITION_SOURCE_IDS.alkisParcels
  return [`${id}-fill-hit`, `${id}-line-dash`]
}

export type AcquisitionAlkisParcelsLayersProps = {
  parcels: FeatureCollection<Geometry, AlkisWfsParcelProperties>
}

/**
 * ALKIS parcel fill + outlines. Renders below {@link SubsubsectionGeometryLayers} on the acquisition map.
 * Source and Layer are siblings (same pattern as {@link UnifiedFeaturesLayer}).
 */
export function AcquisitionAlkisParcelsLayers({ parcels }: AcquisitionAlkisParcelsLayersProps) {
  const alkisId = ACQUISITION_SOURCE_IDS.alkisParcels
  const alkisAttribution = useAlkisAttribution()
  const attributionHtml = alkisAttributionToHtml(alkisAttribution)

  return (
    <>
      <Source
        id={alkisId}
        key={alkisId}
        type="geojson"
        data={parcels}
        attribution={attributionHtml}
      />
      <Layer
        id={`${alkisId}-fill-hit`}
        type="fill"
        source={alkisId}
        filter={["match", ["geometry-type"], ["Polygon", "MultiPolygon"], true, false]}
        paint={acquisitionAreaParcelFillPaint}
      />
      <Layer
        id={`${alkisId}-line-dash`}
        type="line"
        source={alkisId}
        paint={acquisitionAreaParcelLineDashPaint}
      />
    </>
  )
}

export type AcquisitionAreaOverlaysLayersProps = {
  bufferOutlineData: FeatureCollection<Geometry, GeoJsonProperties>
  acquisitionAreasFc: FeatureCollection<Geometry, GeoJsonProperties>
}

const fillColor: ExpressionSpecification = [
  "case",
  ["boolean", ["feature-state", "selected"], false],
  "#2563eb",
  ["boolean", ["get", "hasExistingAcquisitionArea"], false],
  "#f59e0b",
  "#94a3b8",
]

const fillOpacity: ExpressionSpecification = [
  "case",
  ["boolean", ["feature-state", "selected"], false],
  0.35,
  0.3,
]

const lineColor: ExpressionSpecification = [
  "case",
  ["boolean", ["feature-state", "selected"], false],
  "#2563eb",
  ["boolean", ["get", "hasExistingAcquisitionArea"], false],
  "#f59e0b",
  "#94a3b8",
]

const lineWidth: ExpressionSpecification = [
  "case",
  ["boolean", ["feature-state", "selected"], false],
  2,
  1,
]

const lineDasharray: ExpressionSpecification = [
  "case",
  ["boolean", ["feature-state", "selected"], false],
  ["literal", [1, 0]],
  ["boolean", ["get", "hasExistingAcquisitionArea"], false],
  ["literal", [2, 1]],
  ["literal", [4, 2]],
]

/**
 * Buffer outline and potential acquisition polygons. Renders above {@link SubsubsectionGeometryLayers}.
 * Source and Layer are siblings (same pattern as {@link UnifiedFeaturesLayer}).
 * Potential areas use feature-state `selected` for styling (see {@link ACQUISITION_POTENTIAL_AREAS_SOURCE_ID}).
 */
export function AcquisitionAreaOverlaysLayers({
  bufferOutlineData,
  acquisitionAreasFc,
}: AcquisitionAreaOverlaysLayersProps) {
  const bufferId = ACQUISITION_SOURCE_IDS.bufferOutline
  const potentialId = ACQUISITION_SOURCE_IDS.potentialAreas

  return (
    <>
      <Source id={bufferId} key={bufferId} type="geojson" data={bufferOutlineData} />
      <Layer
        id={`${bufferId}-line`}
        type="line"
        source={bufferId}
        paint={{
          "line-color": "#2563eb",
          "line-opacity": 0.5,
          "line-width": 2,
          "line-dasharray": [6, 3],
        }}
      />

      <Source
        id={potentialId}
        key={potentialId}
        type="geojson"
        data={acquisitionAreasFc}
        promoteId="featureId"
      />
      <Layer
        id={`${potentialId}-fill`}
        type="fill"
        source={potentialId}
        paint={{
          "fill-color": fillColor,
          "fill-opacity": fillOpacity,
        }}
      />
      <Layer
        id={`${potentialId}-line`}
        type="line"
        source={potentialId}
        paint={{
          "line-color": lineColor,
          "line-width": lineWidth,
          "line-dasharray": lineDasharray,
        }}
      />
    </>
  )
}
