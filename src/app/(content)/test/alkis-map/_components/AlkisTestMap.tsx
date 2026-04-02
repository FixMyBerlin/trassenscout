"use client"

import { BackgroundSwitcher, type LayerType } from "@/src/core/components/Map/BackgroundSwitcher"
import { getMapStyle } from "@/src/core/components/Map/mapStyleConfig"
import type { FeatureCollection, Geometry } from "geojson"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Map, { Layer, NavigationControl, ScaleControl, Source, type MapRef } from "react-map-gl/maplibre"

const BERLIN_WFS_URL = "https://gdi.berlin.de/services/wfs/alkis_flurstuecke"
const BERLIN_TYPENAME = "alkis_flurstuecke:flurstuecke"

const MIN_FETCH_ZOOM = 14
const FETCH_DEBOUNCE_MS = 300
const MAX_FEATURES = 5000

const emptyFeatureCollection: FeatureCollection<Geometry, Record<string, unknown>> = {
  type: "FeatureCollection",
  features: [],
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

  const mapStyle = useMemo(() => getMapStyle(selectedLayer), [selectedLayer])

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

