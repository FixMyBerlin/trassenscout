"use client"

import { GeometryDrawingMap } from "@/src/core/components/forms/GeometryDrawingMap"
import { GeometryInputBase } from "@/src/core/components/forms/GeometryInputBase"
import { BackgroundGeometryLayers } from "@/src/core/components/Map/BackgroundGeometryLayers"
import { landAcquisitionEditLegendConfig } from "@/src/core/components/Map/LandAcquisitionEditMap.legendConfig"
import {
  GeometryDrawingAcquisitionAreaParcelContextLayers,
  GeometryDrawingAcquisitionAreaPreviewLayers,
} from "@/src/core/components/Map/TerraDraw/TerraDrawContextLayers"
import {
  AcquisitionAreaGeometrySchema,
  type TAcquisitionAreaGeometrySchema,
} from "@/src/server/acquisitionAreas/schema"
import { type SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import { feature, featureCollection } from "@turf/helpers"
import { intersect } from "@turf/turf"
import { useCallback, useMemo, useRef } from "react"
import { useFormContext } from "react-hook-form"

type Props = {
  parcelGeometry: TAcquisitionAreaGeometrySchema
  subsubsectionGeometry: SupportedGeometry
}

const isAcquisitionAreaGeometryType = (
  geometryType: string | null,
): geometryType is "Polygon" | "MultiPolygon" =>
  geometryType === "Polygon" || geometryType === "MultiPolygon"

const removePolygonHoles = (
  geometry: TAcquisitionAreaGeometrySchema,
): TAcquisitionAreaGeometrySchema => {
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

export const AcquisitionAreaGeometryInput = ({ parcelGeometry, subsubsectionGeometry }: Props) => {
  const { watch } = useFormContext()
  const rawGeometry = watch("geometry")
  const currentGeometry = useMemo(
    () => AcquisitionAreaGeometrySchema.parse(rawGeometry),
    [rawGeometry],
  )
  const editableGeometry = useMemo(() => removePolygonHoles(currentGeometry), [currentGeometry])
  const lastValidGeometryRef = useRef<TAcquisitionAreaGeometrySchema>(currentGeometry)

  const transformGeometry = useCallback(
    (geometry: SupportedGeometry | null, geometryType: string | null) => {
      if (!geometry || !isAcquisitionAreaGeometryType(geometryType)) {
        return {
          geometry: lastValidGeometryRef.current,
          geometryType: lastValidGeometryRef.current.type,
        }
      }

      const polygonGeometry = AcquisitionAreaGeometrySchema.parse(geometry)

      const clippedFeature = intersect(
        featureCollection([feature(polygonGeometry, {}), feature(parcelGeometry, {})]),
      )

      if (!clippedFeature?.geometry) {
        return {
          geometry: lastValidGeometryRef.current,
          geometryType: lastValidGeometryRef.current.type,
        }
      }

      const clippedGeometry = AcquisitionAreaGeometrySchema.parse(clippedFeature.geometry)
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
      description="Bearbeiten Sie die Geometrie direkt auf der Karte. Die Verhandlungsfläche wird dabei automatisch auf das Flurstück zugeschnitten."
      contentContainerClassName="border-0 bg-transparent p-0"
      showPreviewLink={false}
    >
      <GeometryDrawingMap
        allowedTypes={["polygon"]}
        displayedGeometry={editableGeometry}
        hideUnselectedPolygonOutline
        legendItemsConfig={landAcquisitionEditLegendConfig}
        showHint={false}
        syncTransformedGeometryToMap={false}
        transformGeometry={transformGeometry}
      >
        <BackgroundGeometryLayers
          subsubsectionGeometries={[subsubsectionGeometry]}
          colorSchema="subsubsection"
          showPoints={false}
          showLineEndPoints={false}
        />
        <GeometryDrawingAcquisitionAreaParcelContextLayers parcelGeometry={parcelGeometry} />
        <GeometryDrawingAcquisitionAreaPreviewLayers geometry={currentGeometry} />
      </GeometryDrawingMap>
    </GeometryInputBase>
  )
}
