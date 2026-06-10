import { useQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { feature, featureCollection } from "@turf/helpers"
import { intersect } from "@turf/turf"
import { useCallback, useMemo, useRef } from "react"
import { lookupTableRows } from "@/src/components/abschnitte/utils/lookupTableRows"
import type { AcquisitionAreaStatusStyle } from "@/src/components/acquisition-area-status/acquisitionAreaStatusStyles"
import { acquisitionAreaStatusStyles } from "@/src/components/acquisition-area-status/acquisitionAreaStatusStyles"
import { GeometryDrawingMap } from "@/src/components/core/components/forms/GeometryDrawingMap"
import { GeometryInputBase } from "@/src/components/core/components/forms/GeometryInputBase"
import { useFormValue } from "@/src/components/core/components/forms/hooks/useFormValue"
import { BackgroundGeometryLayers } from "@/src/components/core/components/Map/BackgroundGeometryLayers"
import { getLandAcquisitionEditLegendConfig } from "@/src/components/core/components/Map/LandAcquisitionEditMap.legendConfig"
import {
  GeometryDrawingAcquisitionAreaParcelContextLayers,
  GeometryDrawingAcquisitionAreaPreviewLayers,
} from "@/src/components/core/components/Map/TerraDraw/TerraDrawContextLayers"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import {
  AcquisitionAreaGeometrySchema,
  type TAcquisitionAreaGeometrySchema,
} from "@/src/shared/acquisitionAreas/schemas"
import { type SupportedGeometry } from "@/src/shared/geometry/geometrySchemas"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

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

const toAcquisitionAreaStatusStyle = (style: number) => {
  if (style === 2 || style === 3 || style === 4) return style
  return 1
}

export const AcquisitionAreaGeometryInput = ({ parcelGeometry, subsubsectionGeometry }: Props) => {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const rawGeometry = useFormValue("geometry")
  const rawAcquisitionAreaStatusId = useFormValue("acquisitionAreaStatusId")
  const { data: statusData } = useQuery({
    ...adminLookupRowsWithCountQueryOptions({ projectSlug, table: "acquisitionAreaStatuses" }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
  const acquisitionAreaStatuses = lookupTableRows<{ id: number; style: number }>(
    statusData as Parameters<typeof lookupTableRows>[0],
    "acquisitionAreaStatuses",
  )
  const currentGeometry = useMemo(
    () => AcquisitionAreaGeometrySchema.parse(rawGeometry),
    [rawGeometry],
  )
  const currentAcquisitionAreaStatusStyle = useMemo<AcquisitionAreaStatusStyle>(() => {
    const statusId = Number(rawAcquisitionAreaStatusId)
    if (!Number.isFinite(statusId)) return 1

    const style = acquisitionAreaStatuses.find((status) => status.id === statusId)?.style
    return toAcquisitionAreaStatusStyle(style ?? 1)
  }, [acquisitionAreaStatuses, rawAcquisitionAreaStatusId])
  const currentAcquisitionAreaColor = useMemo(
    () =>
      acquisitionAreaStatusStyles[currentAcquisitionAreaStatusStyle]?.color ??
      acquisitionAreaStatusStyles[1].color,
    [currentAcquisitionAreaStatusStyle],
  )
  const legendItemsConfig = useMemo(
    () => getLandAcquisitionEditLegendConfig(currentAcquisitionAreaStatusStyle),
    [currentAcquisitionAreaStatusStyle],
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
        legendItemsConfig={legendItemsConfig}
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
        <GeometryDrawingAcquisitionAreaPreviewLayers
          geometry={currentGeometry}
          color={currentAcquisitionAreaColor}
        />
      </GeometryDrawingMap>
    </GeometryInputBase>
  )
}
