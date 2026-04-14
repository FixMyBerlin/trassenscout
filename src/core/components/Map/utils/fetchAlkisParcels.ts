import { feature, featureCollection } from "@turf/helpers"
import type { Feature, FeatureCollection, GeoJsonProperties, Geometry } from "geojson"
import { alkisStateConfig } from "../../../../app/api/(auth)/[projectSlug]/alkis-wfs-parcels/_utils/alkisStateConfig"

export type AlkisViewportBbox = [west: number, south: number, east: number, north: number]

export const emptyAlkisFeatureCollection = featureCollection([])

type FetchAlkisParcelsArgs = {
  alkisStateKey: keyof typeof alkisStateConfig
  bbox: AlkisViewportBbox
  signal?: AbortSignal
}

function buildAlkisWfsUrl({
  wfsUrl,
  typeName,
  bbox,
}: {
  wfsUrl: string
  typeName: string
  bbox: AlkisViewportBbox
}) {
  const srs = "EPSG:4326"

  const params = new URLSearchParams({
    SERVICE: "WFS",
    VERSION: "2.0.0",
    REQUEST: "GetFeature",
    TYPENAMES: typeName,
    SRSNAME: srs,
    BBOX: `${bbox.join(",")},${srs}`,
    COUNT: "5000",
    OUTPUTFORMAT: "application/json",
  })

  return `${wfsUrl}?${params.toString()}`
}

function normalizeFeatureCollection(data: unknown): FeatureCollection<Geometry, GeoJsonProperties> {
  if (
    typeof data !== "object" ||
    data === null ||
    !("type" in data) ||
    data.type !== "FeatureCollection" ||
    !("features" in data) ||
    !Array.isArray(data.features)
  ) {
    throw new Error("Unexpected ALKIS WFS response format")
  }

  return featureCollection(
    data.features.map((featureData, index) => {
      if (typeof featureData !== "object" || featureData === null) {
        throw new Error("Unexpected ALKIS feature format")
      }

      const typedFeature = featureData as {
        type?: Feature["type"]
        id?: string | number
        properties?: GeoJsonProperties
        geometry: Geometry
      }

      return {
        ...feature(typedFeature.geometry, typedFeature.properties ?? {}),
        id: typedFeature.id ?? typedFeature.properties?.id ?? `alkis-${index}`,
      }
    }),
  )
}

export async function fetchAlkisParcels({
  alkisStateKey,
  bbox,
  signal,
}: FetchAlkisParcelsArgs): Promise<FeatureCollection<Geometry, GeoJsonProperties>> {
  const config = alkisStateConfig[alkisStateKey]
  if (
    !config?.wfsUrl ||
    !config.parcelPropertyKey ||
    config.wfsSupportsJson !== true ||
    config.supports4326 !== true
  ) {
    return emptyAlkisFeatureCollection
  }

  // `parcelPropertyKey` currently stores the WFS feature type name in the shared config.
  const url = buildAlkisWfsUrl({
    wfsUrl: config.wfsUrl,
    typeName: config.parcelPropertyKey,
    bbox,
  })

  const response = await fetch(url, {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`ALKIS WFS request failed with status ${response.status}`)
  }

  const data = (await response.json()) as unknown
  return normalizeFeatureCollection(data)
}
