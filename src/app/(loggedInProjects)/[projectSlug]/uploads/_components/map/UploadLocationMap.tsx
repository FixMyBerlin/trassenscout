"use client"

import { blueButtonStyles, linkStyles } from "@/src/core/components/links/styles"
import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { UploadMarkers } from "@/src/core/components/Map/UploadMarkers"
import { geometriesBbox, geometryBbox } from "@/src/core/components/Map/utils/bboxHelpers"
import { getSubsectionFeatures } from "@/src/core/components/Map/utils/getSubsectionFeatures"
import { getSubsubsectionFeatures } from "@/src/core/components/Map/utils/getSubsubsectionFeatures"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { TGetSubsection } from "@/src/server/subsections/queries/getSubsection"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import { UploadSchema } from "@/src/server/uploads/schema"
import { useQuery } from "@blitzjs/rpc"
import { XMarkIcon } from "@heroicons/react/16/solid"
import { featureCollection } from "@turf/helpers"
import type { FeatureCollection, Point } from "geojson"
import { useFormContext } from "react-hook-form"
import { Marker, MarkerDragEvent } from "react-map-gl/maplibre"
import { twMerge } from "tailwind-merge"
import { z } from "zod"
import { UploadPin } from "./UploadPin"

export const UploadLocationMap = () => {
  const { setValue, watch } = useFormContext<z.infer<typeof UploadSchema>>()
  const latitude = watch("latitude")
  const longitude = watch("longitude")
  const subsectionId = watch("subsectionId")
  const subsubsectionId = watch("subsubsectionId")
  const projectSlug = useProjectSlug()

  const [{ subsections }] = useQuery(getSubsections, { projectSlug })
  const [{ subsubsections }] = useQuery(getSubsubsections, { projectSlug })

  const currentSubsection = subsections.find((ss: TGetSubsection) => {
    return ss.id === subsectionId
  })
  const currentSubsubsection = subsubsections.find((ss) => {
    return ss.id === subsubsectionId
  })
  const filteredSubsubsections = !subsectionId
    ? subsubsections
    : subsubsections.filter((ss) => ss.subsection.slug === currentSubsection?.slug)

  // Determine color schema based on whether subsubsectionId exists
  const colorSchema = subsubsectionId ? ("subsubsection" as const) : ("subsection" as const)

  // Extract subsection features
  const {
    lines: subsectionLines,
    lineEndPoints: subsectionLineEndPoints,
    polygons: subsectionPolygons,
  } = getSubsectionFeatures({
    subsections,
    highlight: "currentSubsection",
    selectedSubsectionSlug: currentSubsection?.slug ?? "",
  })

  // Extract subsubsection features
  const subsubsectionFeatures = getSubsubsectionFeatures({
    subsubsections: filteredSubsubsections,
    selectedSubsubsectionSlug: currentSubsubsection?.slug ?? null,
  })

  // Combine features for BaseMap
  const subsectionFeaturesList = subsectionLines?.features || []
  const subsubsectionFeaturesList = subsubsectionFeatures.lines?.features || []
  const allLines =
    subsectionFeaturesList.length === 0 && subsubsectionFeaturesList.length === 0
      ? undefined
      : featureCollection([...subsectionFeaturesList, ...subsubsectionFeaturesList])

  const subsectionPolygonsList = subsectionPolygons?.features || []
  const subsubsectionPolygonsList = subsubsectionFeatures.polygons?.features || []
  const allPolygons =
    subsectionPolygonsList.length === 0 && subsubsectionPolygonsList.length === 0
      ? undefined
      : featureCollection([...subsectionPolygonsList, ...subsubsectionPolygonsList])

  const subsubsectionPointsList = subsubsectionFeatures.points?.features || []
  const allPoints = subsubsectionPointsList.length === 0 ? undefined : subsubsectionFeatures.points

  const allLineEndPoints: FeatureCollection<Point, { lineId?: string | number }> | undefined =
    !subsectionLineEndPoints?.features?.length &&
    !subsubsectionFeatures.lineEndPoints?.features?.length
      ? undefined
      : (featureCollection([
          ...(subsectionLineEndPoints?.features ?? []),
          ...(subsubsectionFeatures.lineEndPoints?.features ?? []),
        ]) as FeatureCollection<Point, { lineId?: string | number }>)

  // Get current position from form values
  const hasPosition = typeof latitude === "number" && typeof longitude === "number"

  // 1. If we have a subsection from URL params, use its bbox
  // 2. Otherwise, use project bbox
  const mapBbox = currentSubsection
    ? geometryBbox(currentSubsection.geometry)
    : subsections.length > 0
      ? geometriesBbox(subsections.map((ss) => ss.geometry))
      : undefined

  const initialViewState = hasPosition
    ? { latitude, longitude, zoom: 12 }
    : { bounds: mapBbox, fitBoundsOptions: { padding: 5 } }

  const onMarkerDragEnd = (event: MarkerDragEvent) => {
    setValue("latitude", event.lngLat.lat, { shouldValidate: true })
    setValue("longitude", event.lngLat.lng, { shouldValidate: true })
  }

  const handlePlacePin = () => {
    const bounds = initialViewState?.bounds
    if (!bounds) {
      return
    }
    const [minLng, minLat, maxLng, maxLat] = bounds
    setValue("latitude", (minLat + maxLat) / 2, { shouldValidate: true })
    setValue("longitude", (minLng + maxLng) / 2, { shouldValidate: true })
  }

  const handleDeleteLocation = () => {
    setValue("latitude", null, { shouldValidate: true })
    setValue("longitude", null, { shouldValidate: true })
  }

  return (
    <>
      <div className="relative">
        <BaseMap
          id="uploadLocationMap"
          initialViewState={initialViewState!}
          classHeight={hasPosition ? undefined : "h-32 sm:h-[166px]"}
          colorSchema={colorSchema}
          lines={allLines}
          polygons={allPolygons}
          points={allPoints}
          lineEndPoints={allLineEndPoints}
          interactiveLayerIds={[]}
        >
          <UploadMarkers projectSlug={projectSlug} interactive={false} />
          {hasPosition && (
            <Marker
              longitude={longitude}
              latitude={latitude}
              anchor="bottom"
              draggable
              onDragEnd={onMarkerDragEnd}
              style={{ zIndex: 10 }}
            >
              <UploadPin />
            </Marker>
          )}
        </BaseMap>
        {!hasPosition && (
          <button
            type="button"
            onClick={handlePlacePin}
            className={twMerge(
              blueButtonStyles,
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "shadow-2xl ring-8 ring-white/90",
              "w-auto px-3 py-2 text-xs whitespace-nowrap sm:px-6 sm:py-3.5 sm:text-sm",
            )}
          >
            Datei auf der Karte verorten
          </button>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-sm text-gray-500">
          <span className="hidden sm:inline">Geokoordinaten: </span>
          {typeof latitude === "number" && typeof longitude === "number" ? (
            <>
              {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </>
          ) : (
            "—"
          )}
        </p>
        {hasPosition && (
          <button
            className={twMerge(linkStyles, "flex cursor-pointer items-center gap-2")}
            onClick={handleDeleteLocation}
            title="Standort löschen"
          >
            <XMarkIcon className="size-5" />
            Standort zurücksetzen
          </button>
        )}
      </div>
    </>
  )
}
