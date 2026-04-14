"use client"

import {
  polygonFeatureToFeatureCollection,
  potentialAcquisitionAreasToFeatureCollection,
} from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/fuehrung/[subsubsectionSlug]/land-acquisition/acquisition-areas/new/_components/potentialAcquisitionAreaGeoJson"
import { PotentialAcquisitionArea } from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/fuehrung/[subsubsectionSlug]/land-acquisition/acquisition-areas/new/_components/potentialAcquisitionAreaTypes"
import { SubsubsectionGeometryLayers } from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/fuehrung/[subsubsectionSlug]/land-acquisition/acquisition-areas/new/_components/SubsubsectionGeometryLayers"
import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { geometryBbox } from "@/src/core/components/Map/utils/bboxHelpers"
import { computeBufferPolygonFeature } from "@/src/core/components/Map/utils/computeBufferPolygonFeature"
import { Spinner } from "@/src/core/components/Spinner"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import type { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import getSubsubsection, {
  type SubsubsectionWithPosition,
} from "@/src/server/subsubsections/queries/getSubsubsection"
import { bbox } from "@turf/bbox"
import { featureCollection } from "@turf/helpers"
import type { FeatureCollection, Geometry } from "geojson"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Layer, MapLayerMouseEvent, Popup, Source } from "react-map-gl/maplibre"
import { buildAlkisWfsProxyUrl } from "./alkisWfsMapHelpers"
import { computePotentialAcquisitionAreas } from "./computePotentialAcquisitionAreas"
import { formatPropertyValue, sortedPropertyEntries } from "./parcelFeatureProperties"

type Props = {
  subsubsection: Awaited<ReturnType<typeof getSubsubsection>>
  bufferRadius: number
  potentialAcquisitionAreas: PotentialAcquisitionArea[]
  setPotentialAcquisitionAreas: (areas: PotentialAcquisitionArea[]) => void
}

const PARCEL_LAYER_IDS = [
  "alkis-parcels-fill-hit",
  "alkis-parcels-line-base",
  "alkis-parcels-line-dash",
] as const

export function AcquisitionAreaMap({
  subsubsection,
  bufferRadius,
  potentialAcquisitionAreas,
  setPotentialAcquisitionAreas,
}: Props) {
  const subsubsectionEntity = subsubsection as SubsubsectionWithPosition
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

  const subsubsectionBbox = useMemo(
    () => geometryBbox(subsubsectionEntity.geometry),
    [subsubsectionEntity.geometry],
  )

  const bufferPolygonFeature = useMemo(
    () =>
      computeBufferPolygonFeature(subsubsectionEntity.geometry as SupportedGeometry, bufferRadius),
    [subsubsectionEntity.geometry, bufferRadius],
  )

  // Use the buffer polygon's bbox so the WFS request covers parcels up to bufferRadius beyond the geometry.
  const fetchBbox = useMemo(() => {
    if (!bufferPolygonFeature) return subsubsectionBbox
    return bbox(bufferPolygonFeature) as [number, number, number, number]
  }, [bufferPolygonFeature, subsubsectionBbox])

  const bufferOutlineData = useMemo(
    () => polygonFeatureToFeatureCollection(bufferPolygonFeature),
    [bufferPolygonFeature],
  )

  const selectedAcquisitionAreasFc = useMemo(
    () => potentialAcquisitionAreasToFeatureCollection(potentialAcquisitionAreas, true),
    [potentialAcquisitionAreas],
  )

  const deselectedAcquisitionAreasFc = useMemo(
    () => potentialAcquisitionAreasToFeatureCollection(potentialAcquisitionAreas, false),
    [potentialAcquisitionAreas],
  )

  const initialViewState = useMemo(() => {
    const [w, s, e, n] = subsubsectionBbox
    return {
      bounds: [w, s, e, n] as [number, number, number, number],
      fitBoundsOptions: { padding: 40 },
    }
  }, [subsubsectionBbox])

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
  }, [projectSlug, fetchBbox])

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
        initialViewState={initialViewState}
        interactiveLayerIds={[...PARCEL_LAYER_IDS]}
        onClick={handleParcelClick}
        onContextMenu={handleContextMenu}
        scrollZoom
        classHeight="h-[520px]"
        colorSchema="subsubsection"
      >
        <Source id="alkis-parcels" type="geojson" data={parcels}>
          <Layer
            id="alkis-parcels-fill-hit"
            type="fill"
            source="alkis-parcels"
            filter={["match", ["geometry-type"], ["Polygon", "MultiPolygon"], true, false]}
            paint={{
              "fill-color": "#ec4899",
              "fill-opacity": 0.08,
            }}
          />
          <Layer
            id="alkis-parcels-line-base"
            type="line"
            source="alkis-parcels"
            paint={{
              "line-color": "#ec4899",
              "line-opacity": 0.28,
              "line-width": 2,
            }}
          />
          <Layer
            id="alkis-parcels-line-dash"
            type="line"
            source="alkis-parcels"
            paint={{
              "line-color": "#ec4899",
              "line-width": 1.5,
              "line-dasharray": [3, 2],
            }}
          />
        </Source>

        <SubsubsectionGeometryLayers subsubsections={[subsubsectionEntity]} />

        <Source id="acquisition-buffer-outline" type="geojson" data={bufferOutlineData}>
          <Layer
            id="acquisition-buffer-outline-line"
            type="line"
            source="acquisition-buffer-outline"
            paint={{
              "line-color": "#2563eb",
              "line-opacity": 0.5,
              "line-width": 2,
              "line-dasharray": [6, 3],
            }}
          />
        </Source>

        <Source
          id="potential-acquisition-deselected"
          type="geojson"
          data={deselectedAcquisitionAreasFc}
        >
          <Layer
            id="potential-acquisition-deselected-fill"
            type="fill"
            source="potential-acquisition-deselected"
            paint={{
              "fill-color": "#94a3b8",
              "fill-opacity": 0.3,
            }}
          />
          <Layer
            id="potential-acquisition-deselected-line"
            type="line"
            source="potential-acquisition-deselected"
            paint={{
              "line-color": "#94a3b8",
              "line-width": 1,
              "line-dasharray": [4, 2],
            }}
          />
        </Source>

        <Source
          id="potential-acquisition-selected"
          type="geojson"
          data={selectedAcquisitionAreasFc}
        >
          <Layer
            id="potential-acquisition-selected-fill"
            type="fill"
            source="potential-acquisition-selected"
            paint={{
              "fill-color": "#2563eb",
              "fill-opacity": 0.35,
            }}
          />
          <Layer
            id="potential-acquisition-selected-line"
            type="line"
            source="potential-acquisition-selected"
            paint={{
              "line-color": "#2563eb",
              "line-width": 2,
            }}
          />
        </Source>

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
