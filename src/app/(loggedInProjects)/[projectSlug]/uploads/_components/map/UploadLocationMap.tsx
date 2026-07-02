"use client"

import { blueButtonStyles, linkStyles } from "@/src/core/components/links/styles"
import { BackgroundGeometryLayers } from "@/src/core/components/Map/BackgroundGeometryLayers"
import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { getStaticOverlayForProject } from "@/src/core/components/Map/staticOverlay/getStaticOverlayForProject"
import { UploadMarkers } from "@/src/core/components/Map/UploadMarkers"
import { geometriesBbox } from "@/src/core/components/Map/utils/bboxHelpers"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import { UploadFormSchema } from "@/src/server/uploads/schema"
import { useQuery } from "@blitzjs/rpc"
import { XMarkIcon } from "@heroicons/react/16/solid"
import { useFormContext } from "react-hook-form"
import { Marker, MarkerDragEvent } from "react-map-gl/maplibre"
import { twMerge } from "tailwind-merge"
import { z } from "zod"
import { UploadPin } from "./UploadPin"

function subsubsectionIdsFromForm(v: unknown): number[] {
  if (!Array.isArray(v)) return []
  return v.map((x) => Number(x)).filter((n) => !Number.isNaN(n))
}

export const UploadLocationMap = () => {
  const { setValue, watch } = useFormContext<z.infer<typeof UploadFormSchema>>()
  const latitude = watch("latitude")
  const longitude = watch("longitude")
  const subsubsectionIds = subsubsectionIdsFromForm(watch("subsubsections"))
  const projectSlug = useProjectSlug()

  const [{ subsections }] = useQuery(getSubsections, { projectSlug })
  const [{ subsubsections }] = useQuery(getSubsubsections, { projectSlug })

  const subsectionSlugsOfSelection =
    subsubsectionIds.length > 0
      ? new Set(
          subsubsections
            .filter((ss) => subsubsectionIds.includes(ss.id))
            .map((ss) => ss.subsection.slug),
        )
      : null

  const filteredSubsubsections = !subsectionSlugsOfSelection
    ? subsubsections
    : subsubsections.filter((ss) => subsectionSlugsOfSelection.has(ss.subsection.slug))

  // Determine color schema based on whether any Eintrag is selected
  const colorSchema =
    subsubsectionIds.length > 0 ? ("subsubsection" as const) : ("subsection" as const)

  // Get current position from form values
  const hasPosition = typeof latitude === "number" && typeof longitude === "number"

  const mapBbox =
    subsections.length > 0 ? geometriesBbox(subsections.map((ss) => ss.geometry)) : undefined

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
          interactiveLayerIds={[]}
          staticOverlay={getStaticOverlayForProject(projectSlug)}
        >
          <BackgroundGeometryLayers
            subsections={subsections}
            subsubsections={filteredSubsubsections}
            colorSchema={colorSchema}
          />
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
