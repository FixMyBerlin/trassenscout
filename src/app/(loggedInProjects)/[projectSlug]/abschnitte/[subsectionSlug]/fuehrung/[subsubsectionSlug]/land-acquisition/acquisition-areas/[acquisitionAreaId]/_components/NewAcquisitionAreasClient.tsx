"use client"

import { geometryBbox } from "@/src/core/components/Map/utils/bboxHelpers"
import { computeBufferPolygonFeature } from "@/src/core/components/Map/utils/computeBufferPolygonFeature"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getAlkisWfsParcels from "@/src/server/alkis/queries/getAlkisWfsParcels"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { useQuery } from "@blitzjs/rpc"
import { featureCollection } from "@turf/helpers"
import clsx from "clsx"
import type { FeatureCollection, Geometry } from "geojson"
import { useMemo, useState } from "react"
import { AcquisitionAreasWorkspace } from "./AcquisitionAreasWorkspace"
import { computePotentialAcquisitionAreas } from "./computePotentialAcquisitionAreas"

const EMPTY_PARCELS: FeatureCollection<Geometry, Record<string, unknown>> = featureCollection([])

type Props = {
  initialSubsubsection: SubsubsectionWithPosition
}

export function NewAcquisitionAreasClient({ initialSubsubsection }: Props) {
  const projectSlug = useProjectSlug()

  const [bufferRadius, setBufferRadius] = useState(20)

  const bufferPolygonFeature = useMemo(
    () => computeBufferPolygonFeature(initialSubsubsection.geometry, bufferRadius),
    [initialSubsubsection.geometry, bufferRadius],
  )

  const [parcelsData, { isLoading, error }] = useQuery(
    getAlkisWfsParcels,
    {
      projectSlug,
      bbox: geometryBbox(bufferPolygonFeature?.geometry ?? initialSubsubsection.geometry),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      keepPreviousData: true,
    },
  )
  const parcels = parcelsData ?? EMPTY_PARCELS
  const errorMessage = error instanceof Error ? error.message : null

  const basePotentialAcquisitionAreas = useMemo(
    () =>
      bufferPolygonFeature ? computePotentialAcquisitionAreas(bufferPolygonFeature, parcels) : [],
    [bufferPolygonFeature, parcels],
  )

  const desktopSharedHeightClass = "lg:h-[620px] xl:h-[700px] 2xl:h-[780px]"
  const mapHeightClass = clsx("h-96 sm:h-[500px]", desktopSharedHeightClass)

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
      mapHeightClass={mapHeightClass}
      desktopSharedHeightClass={desktopSharedHeightClass}
    />
  )
}
