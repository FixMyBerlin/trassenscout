"use client"

import {
  ACQUISITION_POTENTIAL_AREAS_SOURCE_ID,
  AcquisitionAlkisParcelsLayers,
  AcquisitionAreaOverlaysLayers,
  getAcquisitionClickTargetLayerIds,
} from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/fuehrung/[subsubsectionSlug]/land-acquisition/acquisition-areas/new/_components/AcquisitionAreaLayers"
import {
  polygonFeatureToFeatureCollection,
  potentialAcquisitionAreasToFeatureCollection,
} from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/fuehrung/[subsubsectionSlug]/land-acquisition/acquisition-areas/new/_components/potentialAcquisitionAreaGeoJson"
import { PotentialAcquisitionArea } from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/fuehrung/[subsubsectionSlug]/land-acquisition/acquisition-areas/new/_components/potentialAcquisitionAreaTypes"
import { BackgroundGeometryLayers } from "@/src/core/components/Map/BackgroundGeometryLayers"
import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { geometryBbox } from "@/src/core/components/Map/utils/bboxHelpers"
import { computeBufferPolygonFeature } from "@/src/core/components/Map/utils/computeBufferPolygonFeature"
import { Spinner } from "@/src/core/components/Spinner"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import { featureCollection } from "@turf/helpers"
import type { FeatureCollection, Geometry } from "geojson"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MapLayerMouseEvent, Popup, useMap } from "react-map-gl/maplibre"
import { buildAlkisWfsProxyUrl } from "./alkisWfsMapHelpers"
import { computePotentialAcquisitionAreas } from "./computePotentialAcquisitionAreas"
import { formatPropertyValue, sortedPropertyEntries } from "./parcelFeatureProperties"

type Props = {
  subsubsection: SubsubsectionWithPosition
  bufferRadius: number
  potentialAcquisitionAreas: PotentialAcquisitionArea[]
  setPotentialAcquisitionAreas: (areas: PotentialAcquisitionArea[]) => void
}

function PotentialAcquisitionAreasFeatureState({
  potentialAcquisitionAreas,
}: {
  potentialAcquisitionAreas: PotentialAcquisitionArea[]
}) {
  const { mainMap } = useMap()

  useEffect(() => {
    if (!mainMap) return
    const map = mainMap.getMap()
    if (!map.getSource(ACQUISITION_POTENTIAL_AREAS_SOURCE_ID)) return

    for (const area of potentialAcquisitionAreas) {
      map.setFeatureState(
        { source: ACQUISITION_POTENTIAL_AREAS_SOURCE_ID, id: area.id },
        { selected: area.selected },
      )
    }
  }, [mainMap, potentialAcquisitionAreas])

  return null
}

export function AcquisitionAreaMap({
  subsubsection,
  bufferRadius,
  potentialAcquisitionAreas,
  setPotentialAcquisitionAreas,
}: Props) {
  if (!subsubsection) return null

  const abortRef = useRef<AbortController | null>(null)
  const projectSlug = useProjectSlug()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parcels, setParcels] = useState<FeatureCollection<Geometry, Record<string, unknown>>>(
    featureCollection([]),
  )

  const [contextParcel, setContextParcel] = useState<{
    longitude: number
    latitude: number
    properties: Record<string, unknown>
  } | null>(null)

  const bufferPolygonFeature = useMemo(
    () => computeBufferPolygonFeature(subsubsection.geometry, bufferRadius),
    [subsubsection.geometry, bufferRadius],
  )

  const bufferOutlineData = polygonFeatureToFeatureCollection(bufferPolygonFeature)
  const acquisitionAreasFc = potentialAcquisitionAreasToFeatureCollection(potentialAcquisitionAreas)

  useEffect(() => {
    setContextParcel(null)
  }, [parcels])

  useEffect(() => {
    if (!bufferPolygonFeature) {
      setPotentialAcquisitionAreas([])
      return
    }
    setPotentialAcquisitionAreas(computePotentialAcquisitionAreas(bufferPolygonFeature, parcels))
  }, [bufferPolygonFeature, parcels, setPotentialAcquisitionAreas])

  useEffect(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    async function fetchParcels() {
      try {
        setLoading(true)
        setError(null)

        const fetchBbox = geometryBbox(bufferPolygonFeature?.geometry ?? subsubsection.geometry)
        const url = buildAlkisWfsProxyUrl(projectSlug, fetchBbox)
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        })

        if (!res.ok) {
          let msg = `WFS Fehler: HTTP ${res.status}`
          try {
            const errBody = (await res.json()) as { error?: string }
            if (errBody.error) msg = errBody.error
          } catch {
            // keep generic message
          }
          throw new Error(msg)
        }

        const json = (await res.json()) as FeatureCollection<Geometry, Record<string, unknown>>
        if (!json || json.type !== "FeatureCollection" || !Array.isArray(json.features)) {
          throw new Error("Unerwartetes WFS JSON-Format (kein GeoJSON FeatureCollection).")
        }

        setParcels(json)
      } catch (e) {
        if ((e as Error).name === "AbortError") return
        console.error(e)
        setParcels(featureCollection([]))
        setError((e as Error).message ?? "Unbekannter Fehler beim Laden der Flurstücke.")
      } finally {
        setLoading(false)
      }
    }

    void fetchParcels()
    return () => controller.abort()
  }, [projectSlug, bufferPolygonFeature, subsubsection.geometry])

  const handleParcelClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0]
      if (!feature?.properties) return

      const alkisParcelId = (feature.properties as Record<string, unknown>).alkisParcelId as
        | string
        | null
      if (alkisParcelId == null) return

      setPotentialAcquisitionAreas(
        potentialAcquisitionAreas.map((a) =>
          a.alkisParcelId === alkisParcelId ? { ...a, selected: !a.selected } : a,
        ),
      )
    },
    [potentialAcquisitionAreas, setPotentialAcquisitionAreas],
  )

  const handleContextMenu = useCallback((event: MapLayerMouseEvent) => {
    event.preventDefault()
    const feature = event.features?.[0]
    if (!feature?.properties) {
      setContextParcel(null)
      return
    }
    setContextParcel({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
      properties: feature.properties as Record<string, unknown>,
    })
  }, [])

  return (
    <div className="relative w-full">
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: geometryBbox(bufferPolygonFeature?.geometry ?? subsubsection.geometry),
          fitBoundsOptions: { padding: 40 },
        }}
        interactiveLayerIds={getAcquisitionClickTargetLayerIds()}
        onClick={handleParcelClick}
        onContextMenu={handleContextMenu}
        scrollZoom
        classHeight="h-[520px]"
        colorSchema="subsubsection"
      >
        <BackgroundGeometryLayers subsubsections={[subsubsection]} colorSchema="subsubsection" />
        <AcquisitionAlkisParcelsLayers parcels={parcels} />

        <AcquisitionAreaOverlaysLayers
          bufferOutlineData={bufferOutlineData}
          acquisitionAreasFc={acquisitionAreasFc}
        />

        <PotentialAcquisitionAreasFeatureState
          potentialAcquisitionAreas={potentialAcquisitionAreas}
        />

        {contextParcel && (
          <Popup
            longitude={contextParcel.longitude}
            latitude={contextParcel.latitude}
            anchor="bottom"
            closeButton
            closeOnClick={false}
            maxWidth="320px"
            onClose={() => setContextParcel(null)}
          >
            <div className="max-h-64 overflow-y-auto text-xs text-gray-800">
              <p className="mb-2 font-semibold text-gray-900">Flurstück</p>
              <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-x-2 gap-y-1">
                {sortedPropertyEntries(contextParcel.properties).map(([key, value]) => (
                  <div key={key} className="contents">
                    <dt className="wrap-break-word text-gray-500">{key}</dt>
                    <dd className="font-medium wrap-break-word">{formatPropertyValue(value)}</dd>
                  </div>
                ))}
              </dl>
              {sortedPropertyEntries(contextParcel.properties).length === 0 && (
                <p className="text-gray-500">Keine Attribute in diesem Feature.</p>
              )}
            </div>
          </Popup>
        )}
      </BaseMap>

      <div className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center">
        <div className="pointer-events-auto rounded-md bg-gray-800 px-3 py-1.5 text-sm text-white">
          Klick = auswählen/abwählen · Rechtsklick = Details
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-10 mx-12 flex justify-center">
        <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-2 rounded bg-white/80 p-4 px-8 text-center text-base text-gray-800">
          {loading && (
            <div className="flex items-center justify-center">
              <Spinner size="5" />
            </div>
          )}
          {error && <span className="text-rose-700">{error}</span>}
          {!loading && error == null && (
            <span>{parcels.features.length} Flurstücke aus ALKIS geladen.</span>
          )}
        </div>
      </div>
    </div>
  )
}
