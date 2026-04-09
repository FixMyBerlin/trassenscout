"use client"

import { GeometryDrawingMap } from "@/src/core/components/forms/GeometryDrawingMap"
import { GeometryInputBase } from "@/src/core/components/forms/GeometryInputBase"
import type { TerraDrawValidation } from "@/src/core/components/Map/TerraDraw/terraDrawConfig"
import { GeometryDrawingDealAreaParcelContextLayers } from "@/src/core/components/Map/TerraDraw/TerraDrawContextLayers"
import { DealAreaGeometrySchema, type TDealAreaGeometrySchema } from "@/src/server/dealAreas/schema"
import { type SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { feature, featureCollection } from "@turf/helpers"
import { booleanWithin, intersect } from "@turf/turf"
import { useCallback, useMemo, useRef } from "react"
import { useFormContext } from "react-hook-form"
import type { GeoJSONStoreFeatures } from "terra-draw"

type Props = {
  parcelGeometry: TDealAreaGeometrySchema
}

const INVALID_GEOMETRY_MESSAGE = "Die Geometrie der Dealfläche muss ein Polygon sein."
const OUTSIDE_PARCEL_MESSAGE = "Die Dealfläche muss innerhalb der Flurstücksgrenze bleiben."

const isDealAreaGeometryType = (
  geometryType: string | null,
): geometryType is "Polygon" | "MultiPolygon" =>
  geometryType === "Polygon" || geometryType === "MultiPolygon"

const serializeGeometry = (geometry: TDealAreaGeometrySchema) => JSON.stringify(geometry)

export const DealAreaGeometryInput = ({ parcelGeometry }: Props) => {
  const { watch } = useFormContext()
  const rawGeometry = watch("geometry")
  const currentGeometry = useMemo(() => DealAreaGeometrySchema.parse(rawGeometry), [rawGeometry])
  const currentGeometryKey = useMemo(() => serializeGeometry(currentGeometry), [currentGeometry])
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

  const polygonValidation = useCallback<TerraDrawValidation>(
    (candidateFeature: GeoJSONStoreFeatures) => {
      const polygonResult = DealAreaGeometrySchema.safeParse(candidateFeature.geometry)
      if (!polygonResult.success) {
        return { valid: false, reason: INVALID_GEOMETRY_MESSAGE }
      }

      const candidateGeometryKey = serializeGeometry(polygonResult.data)

      if (
        candidateGeometryKey === serializeGeometry(lastValidGeometryRef.current) ||
        candidateGeometryKey === currentGeometryKey
      ) {
        return { valid: true }
      }

      const isWithinParcel = booleanWithin(feature(polygonResult.data), feature(parcelGeometry))

      if (!isWithinParcel) {
        return {
          valid: false,
          reason: OUTSIDE_PARCEL_MESSAGE,
        }
      }

      return { valid: true }
    },
    [currentGeometryKey, parcelGeometry],
  )

  return (
    <GeometryInputBase
      label="Geometrie"
      description="Die Dealfläche ist direkt im Änderungsmodus. Ziehen Sie die Eckpunkte der Fläche auf der Karte. Änderungen außerhalb der Flurstücksgrenze werden automatisch zurückgeschnitten."
      showPreviewLink={false}
    >
      <GeometryDrawingMap
        allowedTypes={["polygon"]}
        showHint={false}
        syncTransformedGeometryToMap={false}
        polygonValidation={polygonValidation}
        transformGeometry={transformGeometry}
      >
        <GeometryDrawingDealAreaParcelContextLayers parcelGeometry={parcelGeometry} />
      </GeometryDrawingMap>
    </GeometryInputBase>
  )
}
