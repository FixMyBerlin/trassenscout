"use client"

import { GeometryDrawingMap } from "@/src/core/components/forms/GeometryDrawingMap"
import { GeometryInputBase } from "@/src/core/components/forms/GeometryInputBase"
import {
  GeometryDrawingDealAreaParcelContextLayers,
  GeometryDrawingDealAreaPreviewLayers,
} from "@/src/core/components/Map/TerraDraw/TerraDrawContextLayers"
import { DealAreaGeometrySchema, type TDealAreaGeometrySchema } from "@/src/server/dealAreas/schema"
import { type SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { featureCollection } from "@turf/helpers"
import { intersect } from "@turf/turf"
import { useCallback, useMemo, useRef } from "react"
import { useFormContext } from "react-hook-form"

type Props = {
  parcelGeometry: TDealAreaGeometrySchema
}

const isDealAreaGeometryType = (
  geometryType: string | null,
): geometryType is "Polygon" | "MultiPolygon" =>
  geometryType === "Polygon" || geometryType === "MultiPolygon"

const removePolygonHoles = (geometry: TDealAreaGeometrySchema): TDealAreaGeometrySchema => {
  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      coordinates: [geometry.coordinates[0]!],
    }
  }

  return {
    type: "MultiPolygon",
    coordinates: geometry.coordinates.map((polygon) => [polygon[0]!]),
  }
}

export const DealAreaGeometryInput = ({ parcelGeometry }: Props) => {
  const { watch } = useFormContext()
  const rawGeometry = watch("geometry")
  const currentGeometry = useMemo(() => DealAreaGeometrySchema.parse(rawGeometry), [rawGeometry])
  const editableGeometry = useMemo(() => removePolygonHoles(currentGeometry), [currentGeometry])
  const lastValidGeometryRef = useRef<TDealAreaGeometrySchema>(currentGeometry)

  const transformGeometry = useCallback(
    (geometry: SupportedGeometry | null, geometryType: string | null) => {
      if (!geometry || !isDealAreaGeometryType(geometryType)) {
        return {
          geometry: lastValidGeometryRef.current,
          geometryType: lastValidGeometryRef.current.type,
        }
      }

      const polygonGeometry = DealAreaGeometrySchema.parse(geometry)

      const clippedFeature = intersect(
        featureCollection([
          { type: "Feature", geometry: polygonGeometry, properties: {} },
          { type: "Feature", geometry: parcelGeometry, properties: {} },
        ]),
      )

      if (!clippedFeature?.geometry) {
        return {
          geometry: lastValidGeometryRef.current,
          geometryType: lastValidGeometryRef.current.type,
        }
      }

      const clippedGeometry = DealAreaGeometrySchema.parse(clippedFeature.geometry)
      lastValidGeometryRef.current = clippedGeometry

      return {
        geometry: clippedGeometry,
        geometryType: clippedGeometry.type,
      }
    },
    [parcelGeometry],
  )

  return (
    <GeometryInputBase
      label="Geometrie"
      description="Die Dealfläche ist direkt im Änderungsmodus. Ziehen Sie die Eckpunkte der Fläche frei auf der Karte. Die rote Vorschau zeigt jederzeit die gültige, auf das Flurstück zugeschnittene Form."
      showPreviewLink={false}
    >
      <GeometryDrawingMap
        allowedTypes={["polygon"]}
        displayedGeometry={editableGeometry}
        hideUnselectedPolygonOutline
        showHint={false}
        syncTransformedGeometryToMap={false}
        transformGeometry={transformGeometry}
      >
        <GeometryDrawingDealAreaParcelContextLayers parcelGeometry={parcelGeometry} />
        <GeometryDrawingDealAreaPreviewLayers geometry={currentGeometry} />
      </GeometryDrawingMap>
    </GeometryInputBase>
  )
}
