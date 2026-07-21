import { useQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { featureCollection } from "@turf/helpers"
import { useMemo, useState } from "react"
import { geometryBbox } from "@/src/components/core/components/Map/utils/bboxHelpers"
import { computeBufferPolygonFeature } from "@/src/components/core/components/Map/utils/computeBufferPolygonFeature"
import { MAP_FULLSCREEN_HEIGHT_CLASS } from "@/src/components/core/components/PageHeader/MapListViewLayout"
import { acquisitionAreasBySubsubsectionQueryOptions } from "@/src/server/acquisitionAreas/acquisitionAreasAbschnitteQueryOptions"
import { getAlkisWfsParcelsFn } from "@/src/server/alkis/alkis.functions"
import type { AlkisWfsParcelFeatureCollection } from "@/src/server/alkis/alkisWfsParcelGeoJsonTypes"
import type { SubsubsectionWithPosition } from "@/src/server/subsubsections/types"
import { AcquisitionAreasWorkspace } from "./AcquisitionAreasWorkspace"
import { computePotentialAcquisitionAreas } from "./computePotentialAcquisitionAreas"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

const EMPTY_PARCELS: AlkisWfsParcelFeatureCollection = featureCollection([])

type Props = {
  initialSubsubsection: SubsubsectionWithPosition
}

export function NewAcquisitionAreasForm({ initialSubsubsection }: Props) {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const [bufferRadius, setBufferRadius] = useState(20)

  const { data: existingAcquisitionAreas = [] } = useQuery(
    acquisitionAreasBySubsubsectionQueryOptions({
      projectSlug,
      subsubsectionId: initialSubsubsection.id,
    }),
  )

  const bufferPolygonFeature = useMemo(
    () => computeBufferPolygonFeature(initialSubsubsection.geometry, bufferRadius),
    [initialSubsubsection.geometry, bufferRadius],
  )

  const bbox = geometryBbox(bufferPolygonFeature?.geometry ?? initialSubsubsection.geometry)
  const {
    data: parcelsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["alkisWfsParcels", projectSlug, bbox, bufferRadius],
    queryFn: async () =>
      (await getAlkisWfsParcelsFn({
        data: { projectSlug, bbox, count: 5000 },
      })) as AlkisWfsParcelFeatureCollection,
    refetchOnWindowFocus: false,
  })
  const parcels = parcelsData ?? EMPTY_PARCELS
  const errorMessage = error instanceof Error ? error.message : null

  const basePotentialAcquisitionAreas = useMemo(() => {
    if (!bufferPolygonFeature) return []

    const existingByAlkisParcelId = new Map(
      existingAcquisitionAreas
        .map((area) => [area.parcel.alkisParcelId, area.id] as const)
        .filter(([alkisParcelId]) => Boolean(alkisParcelId)),
    )

    return computePotentialAcquisitionAreas(bufferPolygonFeature, parcels).map((area) => ({
      ...area,
      existingAcquisitionAreaId: area.alkisParcelId
        ? (existingByAlkisParcelId.get(area.alkisParcelId) ?? null)
        : null,
      existingMode: "keep" as const,
    }))
  }, [bufferPolygonFeature, parcels, existingAcquisitionAreas])

  return (
    <AcquisitionAreasWorkspace
      key={bufferRadius}
      initialSubsubsection={initialSubsubsection}
      projectSlug={projectSlug}
      bufferRadius={bufferRadius}
      onApplyRadius={setBufferRadius}
      bufferPolygonFeature={bufferPolygonFeature}
      parcels={parcels}
      isLoading={isLoading}
      errorMessage={errorMessage}
      basePotentialAcquisitionAreas={basePotentialAcquisitionAreas}
      mapHeightClass={MAP_FULLSCREEN_HEIGHT_CLASS}
    />
  )
}
