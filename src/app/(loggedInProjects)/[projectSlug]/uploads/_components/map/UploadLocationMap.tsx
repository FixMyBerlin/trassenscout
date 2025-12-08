"use client"

import { blueButtonStyles, whiteButtonStyles } from "@/src/core/components/links/styles"
import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { UploadMarkers } from "@/src/core/components/Map/UploadMarkers"
import { geometriesBbox, geometryBbox } from "@/src/core/components/Map/utils/bboxHelpers"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { TGetSubsection } from "@/src/server/subsections/queries/getSubsection"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import { UploadSchema } from "@/src/server/uploads/schema"
import { useQuery } from "@blitzjs/rpc"
import { TrashIcon } from "@heroicons/react/24/outline"
import { useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { Marker, MarkerDragEvent } from "react-map-gl/maplibre"
import { twMerge } from "tailwind-merge"
import { z } from "zod"
import { SubsectionSourceLayers } from "./SubsectionSourceLayers"
import { SubsubsectionSourceLayers } from "./SubsubsectionSourceLayers"
import { UploadPin } from "./UploadPin"

export const UploadLocationMap = () => {
  const { setValue, watch } = useFormContext<z.infer<typeof UploadSchema>>()
  const latitude = watch("latitude")
  const longitude = watch("longitude")
  const subsectionId = watch("subsectionId")
  const projectSlug = useProjectSlug()

  const [{ subsections }] = useQuery(getSubsections, { projectSlug, take: 500 })
  const currentSubsection = subsections.find((ss: TGetSubsection) => {
    return ss.id === subsectionId
  })

  // Get current position from form values
  const hasPosition = typeof latitude === "number" && typeof longitude === "number"

  const mapBbox = useMemo(() => {
    // 1. If we have a subsection from URL params, use its bbox
    if (currentSubsection) {
      return geometryBbox(currentSubsection.geometry)
    }
    // 2. Otherwise, use project bbox
    if (subsections.length > 0) {
      const geometries = subsections.map((ss) => ss.geometry)
      return geometriesBbox(geometries)
    }
  }, [currentSubsection, subsections])

  const initialViewState = useMemo(() => {
    if (hasPosition) {
      return { latitude, longitude, zoom: 12 }
    }
    return { bounds: mapBbox, fitBoundsOptions: { padding: 5 } }
  }, [hasPosition, latitude, longitude, mapBbox])

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
        >
          <SubsectionSourceLayers selectedSubsectionId={subsectionId} />
          <SubsubsectionSourceLayers />
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
            type="button"
            onClick={handleDeleteLocation}
            className={twMerge(whiteButtonStyles, "w-auto px-2 py-1.5", "cursor-pointer")}
            title="Standort löschen"
          >
            <TrashIcon className="size-5" />
          </button>
        )}
      </div>
    </>
  )
}
