"use client"

import { SubsubsectionGeometryLayers } from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/fuehrung/[subsubsectionSlug]/land-acquisition/deal-areas/new/_components/SubsubsectionGeometryLayers"
import { BackgroundSwitcher, type LayerType } from "@/src/core/components/Map/BackgroundSwitcher"
import { getMapStyle } from "@/src/core/components/Map/mapStyleConfig"
import { geometryBbox } from "@/src/core/components/Map/utils/bboxHelpers"
import { getCentralPointOfGeometry } from "@/src/core/components/Map/utils/getCentralPointOfGeometry"
import { Spinner } from "@/src/core/components/Spinner"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import type { SupportedGeometry } from "@/src/server/shared/utils/geometrySchemas"
import getSubsubsection, {
  type SubsubsectionWithPosition,
} from "@/src/server/subsubsections/queries/getSubsubsection"
import { clsx } from "clsx"
import type { FeatureCollection, Geometry } from "geojson"
import "maplibre-gl/dist/maplibre-gl.css"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Map, {
  Layer,
  MapLayerMouseEvent,
  Marker,
  NavigationControl,
  Popup,
  ScaleControl,
  Source,
  useMap,
} from "react-map-gl/maplibre"
import { bboxKey, buildAlkisWfsProxyUrl } from "./alkisWfsMapHelpers"
import { computeBufferPolygonFeature } from "./computeBufferPolygonFeature"
import { computePotentialDealAreas } from "./computePotentialDealAreas"
import {
  emptyFeatureCollection,
  FETCH_DEBOUNCE_MS,
  MIN_FETCH_ZOOM,
  PARCEL_LAYER_IDS,
} from "./dealAreaMapConstants"
import { formatPropertyValue, sortedPropertyEntries } from "./parcelFeatureProperties"
import {
  bufferOutlineFeatureCollection,
  potentialDealAreasToFeatureCollection,
} from "./potentialDealAreaGeoJson"
import type { PotentialDealArea } from "./potentialDealAreaTypes"

type Props = {
  subsubsection: Awaited<ReturnType<typeof getSubsubsection>>
  bufferRadius: number
  potentialDealAreas: PotentialDealArea[]
  setPotentialDealAreas: (areas: PotentialDealArea[]) => void
}

export function DealAreaMap({
  subsubsection,
  bufferRadius,
  potentialDealAreas,
  setPotentialDealAreas,
}: Props) {
  const subsubsectionEntity = subsubsection as SubsubsectionWithPosition
  const { mainMap } = useMap()
  const debounceTimerRef = useRef<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const projectSlug = useProjectSlug()

  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const [zoom, setZoom] = useState<number>(15)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parcels, setParcels] =
    useState<FeatureCollection<Geometry, Record<string, unknown>>>(emptyFeatureCollection)
  const lastBboxKeyRef = useRef<string | null>(null)

  const [cursor, setCursor] = useState<"grab" | "pointer">("grab")
  const [selectedParcel, setSelectedParcel] = useState<{
    longitude: number
    latitude: number
    properties: Record<string, unknown>
  } | null>(null)

  const mapStyle = useMemo(() => getMapStyle(selectedLayer), [selectedLayer])

  const bufferPolygonFeature = useMemo(
    () =>
      computeBufferPolygonFeature(subsubsectionEntity.geometry as SupportedGeometry, bufferRadius),
    [subsubsectionEntity.geometry, bufferRadius],
  )

  const bufferOutlineData = useMemo(
    () => bufferOutlineFeatureCollection(bufferPolygonFeature),
    [bufferPolygonFeature],
  )

  const selectedDealAreasFc = useMemo(
    () => potentialDealAreasToFeatureCollection(potentialDealAreas, true),
    [potentialDealAreas],
  )

  const deselectedDealAreasFc = useMemo(
    () => potentialDealAreasToFeatureCollection(potentialDealAreas, false),
    [potentialDealAreas],
  )

  const initialViewState = useMemo(() => {
    const [w, s, e, n] = geometryBbox(subsubsectionEntity.geometry)
    return {
      bounds: [w, s, e, n] as [number, number, number, number],
      fitBoundsOptions: { padding: 40 },
    }
  }, [subsubsectionEntity.geometry])

  useEffect(() => {
    setSelectedParcel(null)
  }, [parcels])

  useEffect(() => {
    if (!bufferPolygonFeature) {
      setPotentialDealAreas([])
      return
    }
    setPotentialDealAreas(computePotentialDealAreas(bufferPolygonFeature, parcels))
  }, [bufferPolygonFeature, parcels, setPotentialDealAreas])

  const fetchParcelsNow = useCallback(async () => {
    if (!mainMap) return

    const zoom = mainMap.getZoom()
    if (zoom < MIN_FETCH_ZOOM) {
      abortRef.current?.abort()
      abortRef.current = null
      setLoading(false)
      setError(null)
      setParcels(emptyFeatureCollection)
      lastBboxKeyRef.current = null
      return
    }

    const bounds = mainMap.getBounds()
    const key = bboxKey(bounds)
    if (lastBboxKeyRef.current === key) return
    lastBboxKeyRef.current = key

    abortRef.current?.abort()
    // request can be cancelled from the outside
    const controller = new AbortController()
    abortRef.current = controller

    try {
      setLoading(true)
      setError(null)

      const url = buildAlkisWfsProxyUrl(projectSlug, bounds)
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
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
      setParcels(emptyFeatureCollection)
      setError((e as Error).message ?? "Unbekannter Fehler beim Laden der Flurstücke.")
    } finally {
      setLoading(false)
    }
  }, [mainMap, projectSlug])

  // debounces the actual work so every tiny move does not fire a request
  const scheduleFetch = useCallback(() => {
    if (debounceTimerRef.current != null) {
      window.clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = window.setTimeout(() => {
      void fetchParcelsNow()
    }, FETCH_DEBOUNCE_MS)
  }, [fetchParcelsNow])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current != null) window.clearTimeout(debounceTimerRef.current)
      abortRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    if (!mainMap) return
    void fetchParcelsNow()
  }, [mainMap, fetchParcelsNow])

  const showZoomHint = zoom < MIN_FETCH_ZOOM

  const handleParcelClick = useCallback((event: MapLayerMouseEvent) => {
    const feature = event.features?.[0]
    if (!feature?.properties) {
      setSelectedParcel(null)
      return
    }
    setSelectedParcel({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
      properties: feature.properties as Record<string, unknown>,
    })
  }, [])

  const handleParcelMouseMove = useCallback((event: MapLayerMouseEvent) => {
    setCursor((event.features?.length ?? 0) > 0 ? "pointer" : "grab")
  }, [])

  const handleMapMouseLeave = useCallback(() => {
    setCursor("grab")
  }, [])

  return (
    <div className="relative w-full overflow-clip rounded-md border border-gray-200 shadow-sm">
      <div className="h-[520px] w-full">
        <Map
          id="mainMap"
          initialViewState={initialViewState}
          mapStyle={mapStyle}
          cursor={cursor}
          interactiveLayerIds={[...PARCEL_LAYER_IDS]}
          onClick={handleParcelClick}
          onMouseMove={handleParcelMouseMove}
          onMouseLeave={handleMapMouseLeave}
          onLoad={(event) => {
            setZoom(event.target.getZoom())
            scheduleFetch()
          }}
          onMoveEnd={(event) => {
            setZoom(event.target.getZoom())
            scheduleFetch()
          }}
        >
          <NavigationControl showCompass={false} />
          <ScaleControl />

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

          <Source id="deal-buffer-outline" type="geojson" data={bufferOutlineData}>
            <Layer
              id="deal-buffer-outline-line"
              type="line"
              source="deal-buffer-outline"
              paint={{
                "line-color": "#2563eb",
                "line-opacity": 0.5,
                "line-width": 2,
                "line-dasharray": [6, 3],
              }}
            />
          </Source>

          <Source id="potential-deal-deselected" type="geojson" data={deselectedDealAreasFc}>
            <Layer
              id="potential-deal-deselected-fill"
              type="fill"
              source="potential-deal-deselected"
              paint={{
                "fill-color": "#94a3b8",
                "fill-opacity": 0.3,
              }}
            />
            <Layer
              id="potential-deal-deselected-line"
              type="line"
              source="potential-deal-deselected"
              paint={{
                "line-color": "#94a3b8",
                "line-width": 1,
                "line-dasharray": [4, 2],
              }}
            />
          </Source>

          <Source id="potential-deal-selected" type="geojson" data={selectedDealAreasFc}>
            <Layer
              id="potential-deal-selected-fill"
              type="fill"
              source="potential-deal-selected"
              paint={{
                "fill-color": "#2563eb",
                "fill-opacity": 0.35,
              }}
            />
            <Layer
              id="potential-deal-selected-line"
              type="line"
              source="potential-deal-selected"
              paint={{
                "line-color": "#2563eb",
                "line-width": 2,
              }}
            />
          </Source>

          {potentialDealAreas.map((area) => {
            const [lng, lat] = getCentralPointOfGeometry(area.geometry)
            return (
              <Marker key={area.id} longitude={lng} latitude={lat} anchor="center">
                <div
                  className={clsx(
                    "rounded-md border border-gray-400 bg-white px-2 py-1 text-xs font-bold shadow-sm",
                    !area.selected && "opacity-40",
                  )}
                >
                  #{area.id}
                </div>
              </Marker>
            )
          })}

          {selectedParcel && (
            <Popup
              longitude={selectedParcel.longitude}
              latitude={selectedParcel.latitude}
              anchor="bottom"
              closeButton
              closeOnClick={false}
              maxWidth="320px"
              onClose={() => {
                setSelectedParcel(null)
              }}
            >
              <div className="max-h-64 overflow-y-auto text-xs text-gray-800">
                <p className="mb-2 font-semibold text-gray-900">Flurstück</p>
                <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-x-2 gap-y-1">
                  {sortedPropertyEntries(selectedParcel.properties).map(([key, value]) => (
                    <div key={key} className="contents">
                      <dt className="wrap-break-word text-gray-500">{key}</dt>
                      <dd className="font-medium wrap-break-word">{formatPropertyValue(value)}</dd>
                    </div>
                  ))}
                </dl>
                {sortedPropertyEntries(selectedParcel.properties).length === 0 && (
                  <p className="text-gray-500">Keine Attribute in diesem Feature.</p>
                )}
              </div>
            </Popup>
          )}
        </Map>
      </div>

      <BackgroundSwitcher
        position="top-left"
        value={selectedLayer}
        onChange={(layer) => {
          setSelectedLayer(layer)
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-10 mx-12 flex justify-center">
        <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-2 rounded bg-white/80 p-4 px-8 text-center text-base text-gray-800">
          {showZoomHint && (
            <span>Zoome näher ran (Zoom ≥ {MIN_FETCH_ZOOM}), um Flurstücke zu laden.</span>
          )}
          {loading && (
            <div className="flex items-center justify-center">
              <Spinner size="5" />
            </div>
          )}
          {error && <span className="text-rose-700">{error}</span>}
          {zoom >= MIN_FETCH_ZOOM && !loading && error == null && (
            <span>{parcels.features.length} Flurstücke aus ALKIS geladen.</span>
          )}
        </div>
      </div>
    </div>
  )
}
