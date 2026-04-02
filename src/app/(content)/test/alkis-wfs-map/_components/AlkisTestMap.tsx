"use client"

import { BackgroundSwitcher, type LayerType } from "@/src/core/components/Map/BackgroundSwitcher"
import { getMapStyle } from "@/src/core/components/Map/mapStyleConfig"
import type { FeatureCollection, Geometry } from "geojson"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Map, {
  Layer,
  MapLayerMouseEvent,
  NavigationControl,
  Popup,
  ScaleControl,
  Source,
  type MapRef,
} from "react-map-gl/maplibre"

const BERLIN_WFS_URL = "https://gdi.berlin.de/services/wfs/alkis_flurstuecke"
const BERLIN_TYPENAME = "alkis_flurstuecke:flurstuecke"

const MIN_FETCH_ZOOM = 14
const FETCH_DEBOUNCE_MS = 300
const MAX_FEATURES = 5000

const emptyFeatureCollection: FeatureCollection<Geometry, Record<string, unknown>> = {
  type: "FeatureCollection",
  features: [],
}

const PARCEL_LAYER_IDS = [
  "alkis-parcels-fill-hit",
  "alkis-parcels-line-base",
  "alkis-parcels-line-dash",
] as const

function formatPropertyValue(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 0)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

function sortedPropertyEntries(props: Record<string, unknown> | null | undefined) {
  if (!props) return []
  return Object.entries(props)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .sort(([a], [b]) => a.localeCompare(b, "de"))
}

function buildBerlinWfsUrl(bounds: maplibregl.LngLatBoundsLike) {
  const b = maplibregl.LngLatBounds.convert(bounds)

  const west = b.getWest()
  const south = b.getSouth()
  const east = b.getEast()
  const north = b.getNorth()

  const url = new URL(BERLIN_WFS_URL)
  url.searchParams.set("SERVICE", "WFS")
  url.searchParams.set("VERSION", "2.0.0")
  url.searchParams.set("REQUEST", "GetFeature")
  url.searchParams.set("TYPENAMES", BERLIN_TYPENAME)
  url.searchParams.set("SRSNAME", "EPSG:4326")
  // Many WFS endpoints expect lon/lat ordering in BBOX even for EPSG:4326.
  url.searchParams.set("BBOX", `${west},${south},${east},${north},EPSG:4326`)
  url.searchParams.set("COUNT", String(MAX_FEATURES))
  url.searchParams.set("OUTPUTFORMAT", "application/json")
  return url
}

function bboxKey(bounds: maplibregl.LngLatBounds) {
  const round = (n: number) => Math.round(n * 1e5) / 1e5
  return [
    round(bounds.getWest()),
    round(bounds.getSouth()),
    round(bounds.getEast()),
    round(bounds.getNorth()),
  ].join(",")
}

export function AlkisTestMap() {
  const mapRef = useRef<MapRef | null>(null)
  const debounceTimerRef = useRef<number | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const [zoom, setZoom] = useState<number>(15)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parcels, setParcels] = useState<FeatureCollection<Geometry, Record<string, unknown>>>(
    emptyFeatureCollection,
  )
  const lastBboxKeyRef = useRef<string | null>(null)

  const [cursor, setCursor] = useState<"grab" | "pointer">("grab")
  const [selectedParcel, setSelectedParcel] = useState<{
    longitude: number
    latitude: number
    properties: Record<string, unknown>
  } | null>(null)

  const mapStyle = useMemo(() => getMapStyle(selectedLayer), [selectedLayer])

  useEffect(() => {
    setSelectedParcel(null)
  }, [parcels])

  const fetchParcelsNow = useCallback(async () => {
    const map = mapRef.current?.getMap()
    if (!map) return

    const zoom = map.getZoom()
    if (zoom < MIN_FETCH_ZOOM) {
      abortRef.current?.abort()
      abortRef.current = null
      setLoading(false)
      setError(null)
      setParcels(emptyFeatureCollection)
      lastBboxKeyRef.current = null
      return
    }

    const bounds = map.getBounds()
    const key = bboxKey(bounds)
    if (lastBboxKeyRef.current === key) return
    lastBboxKeyRef.current = key

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      setLoading(true)
      setError(null)

      const url = buildBerlinWfsUrl(bounds)
      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      })

      if (!res.ok) {
        throw new Error(`WFS Fehler: HTTP ${res.status}`)
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
  }, [])

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
          ref={(instance) => {
            mapRef.current = instance
          }}
          initialViewState={{
            latitude: 52.520008,
            longitude: 13.404954,
            zoom: 15,
          }}
          mapStyle={mapStyle}
          cursor={cursor}
          interactiveLayerIds={[...PARCEL_LAYER_IDS]}
          onClick={handleParcelClick}
          onMouseMove={handleParcelMouseMove}
          onMouseLeave={handleMapMouseLeave}
          onLoad={() => {
            const map = mapRef.current?.getMap()
            if (map) setZoom(map.getZoom())
            scheduleFetch()
          }}
          onMoveEnd={() => {
            const map = mapRef.current?.getMap()
            if (map) setZoom(map.getZoom())
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
                      <dd className="wrap-break-word font-medium">{formatPropertyValue(value)}</dd>
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

      <div className="pointer-events-none absolute bottom-2 left-2 right-2 flex flex-col gap-2">
        <div className="pointer-events-auto inline-flex w-fit items-center gap-2 rounded-md bg-white/90 px-3 py-2 text-xs text-gray-700 shadow-sm ring-1 ring-gray-200">
          <span className="font-medium">Quelle:</span>
          <span>© Geoportal Berlin / ALKIS</span>
          <span className="mx-2 text-gray-300">|</span>
          <span className="font-medium">WFS:</span>
          <span className="truncate">{BERLIN_WFS_URL}</span>
        </div>

        {(loading || error || showZoomHint) && (
          <div className="pointer-events-auto inline-flex w-fit flex-wrap items-center gap-2 rounded-md bg-white/90 px-3 py-2 text-xs text-gray-700 shadow-sm ring-1 ring-gray-200">
            {showZoomHint && (
              <span>
                Zoome näher ran (Zoom ≥ {MIN_FETCH_ZOOM}), um Flurstücke zu laden.
              </span>
            )}
            {loading && <span>Lade Flurstücke…</span>}
            {error && <span className="text-rose-700">{error}</span>}
            {!loading && !error && !showZoomHint && (
              <span>{parcels.features.length} Features geladen.</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

