import { XMarkIcon } from "@heroicons/react/16/solid"
import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { Marker, MarkerDragEvent } from "react-map-gl/maplibre"
import { twMerge } from "tailwind-merge"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { useFormShellState } from "@/src/components/core/components/forms/hooks/useFormShellState"
import { useFormValue } from "@/src/components/core/components/forms/hooks/useFormValue"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { BackgroundGeometryLayers } from "@/src/components/core/components/Map/BackgroundGeometryLayers"
import { BaseMap } from "@/src/components/core/components/Map/BaseMap"
import { UploadMarkers } from "@/src/components/core/components/Map/markers/UploadMarkers"
import { getStaticOverlayForProject } from "@/src/components/core/components/Map/staticOverlay/getStaticOverlayForProject"
import { geometriesBbox } from "@/src/components/core/components/Map/utils/bboxHelpers"
import { subsectionsQueryOptions } from "@/src/server/subsections/subsectionsQueryOptions"
import { subsubsectionsQueryOptions } from "@/src/server/subsubsections/subsubsectionsQueryOptions"
import { UploadPin } from "./UploadPin"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

function subsubsectionIdsFromForm(v: unknown) {
  if (!Array.isArray(v)) return []
  return v.map((x) => Number(x)).filter((n) => !Number.isNaN(n))
}

export const UploadLocationMap = ({ excludeUploadId }: { excludeUploadId?: number }) => {
  const { form } = useFormShellState()
  const latitude = useFormValue("latitude")
  const longitude = useFormValue("longitude")
  const subsubsectionIds = subsubsectionIdsFromForm(useFormValue("subsubsections"))
  const { projectSlug } = loggedInProjectRouteApi.useParams()

  const subsections = useSuspenseQuery(subsectionsQueryOptions({ projectSlug })).data
  const subsubsections = useSuspenseQuery(subsubsectionsQueryOptions({ projectSlug })).data

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

  const colorSchema =
    subsubsectionIds.length > 0 ? ("subsubsection" as const) : ("subsection" as const)

  const hasPosition = typeof latitude === "number" && typeof longitude === "number"

  const mapBbox =
    subsections.length > 0
      ? geometriesBbox(
          subsections.map((ss) => ss.geometry) as unknown as Parameters<typeof geometriesBbox>[0],
        )
      : undefined

  const initialViewState = hasPosition
    ? { latitude, longitude, zoom: 12 }
    : { bounds: mapBbox, fitBoundsOptions: { padding: 5 } }

  const onMarkerDragEnd = (event: MarkerDragEvent) => {
    form.setFieldValue("latitude", event.lngLat.lat)
    form.setFieldValue("longitude", event.lngLat.lng)
  }

  const handlePlacePin = () => {
    const bounds = initialViewState?.bounds
    if (!bounds) {
      return
    }
    const [minLng, minLat, maxLng, maxLat] = bounds
    form.setFieldValue("latitude", (minLat + maxLat) / 2)
    form.setFieldValue("longitude", (minLng + maxLng) / 2)
  }

  const handleDeleteLocation = () => {
    form.setFieldValue("latitude", null)
    form.setFieldValue("longitude", null)
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
          scrollZoom={false}
          staticOverlay={getStaticOverlayForProject(projectSlug)}
        >
          <BackgroundGeometryLayers
            subsections={
              subsections as unknown as Parameters<
                typeof BackgroundGeometryLayers
              >[0]["subsections"]
            }
            subsubsections={
              filteredSubsubsections as unknown as Parameters<
                typeof BackgroundGeometryLayers
              >[0]["subsubsections"]
            }
            colorSchema={colorSchema}
          />
          <UploadMarkers
            projectSlug={projectSlug}
            interactive={false}
            excludeUploadId={excludeUploadId}
          />
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
              primaryButtonClassName,
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
