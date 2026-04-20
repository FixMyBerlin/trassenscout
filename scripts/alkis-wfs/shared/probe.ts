import {
  buildWfsGetFeatureUrl,
  convertWfsResponseToGeoJson,
  getWfsOutputFormat,
  injectAlkisParcelIdsIntoGeoJson,
} from "@/src/server/alkis/utils/alkisWfs"
import type { StateKeyEnum } from "@prisma/client"
import {
  DEFAULT_COUNT,
  DEFAULT_TIMEOUT_MS,
  PARCEL_ID_CANDIDATE_KEYS,
  PROBE_BBOX_DELTA_DEGREES,
  STATE_TEST_COORDINATES,
} from "./constants"

type CapabilitiesSnapshot = { outputFormats: string[] }

export type ProbeResult = {
  ok: boolean
  httpStatus: number
  supports4326: boolean
  chosenOutputFormat: string | null
  bboxAxisOrder: "lonlat" | "latlon" | null
  projection: "EPSG:25832" | "EPSG:25833" | null
  featureCount: number
  detectedParcelIdPropertyKey: string | null
  firstFeaturePropertyKeys: string[]
  notes: string[]
  error?: string
}

async function fetchProbe(
  url: string,
): Promise<{ ok: boolean; status: number; body: string; error?: string }> {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "*/*" },
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    })
    const body = await res.text()
    if (!res.ok) return { ok: false, status: res.status, body, error: `HTTP ${res.status}` }
    if (body.includes("<ExceptionReport")) {
      return { ok: false, status: res.status, body, error: "OGC ExceptionReport" }
    }
    return { ok: true, status: res.status, body }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, status: 0, body: "", error: msg }
  }
}

function looksLikeEmptyWfsFeatureCollection(body: string): boolean {
  const t = body.trimStart()
  if (!t.startsWith("<")) return false
  if (!/FeatureCollection/i.test(t)) return false
  if (/numberReturned=["']0["']/i.test(t)) return true
  if (/numberOfFeatures=["']0["']/i.test(t)) return true
  return false
}

/** When ogr2ogr fails, WFS still often exposes a reliable feature count in the GML envelope. */
function parseWfsNumberReturned(body: string): number | null {
  const m =
    body.match(/numberReturned=["'](\d+)["']/i) ?? body.match(/numberOfFeatures=["'](\d+)["']/i)
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) ? n : null
}

function detectParcelIdPropertyKey(keys: string[]): string | null {
  for (const candidate of PARCEL_ID_CANDIDATE_KEYS) {
    if (keys.includes(candidate)) return candidate
  }
  return null
}

function bboxFromPoint(lon: number, lat: number, delta: number): [number, number, number, number] {
  return [lon - delta, lat - delta, lon + delta, lat + delta]
}

function outputFormatLooksJson(fmt: string): boolean {
  const lower = fmt.toLowerCase()
  return lower.includes("json") || lower.includes("geo+json")
}

export async function probeGetFeatureForState(params: {
  stateKey: StateKeyEnum
  label: string
  wfsUrl: string
  typename: string
  configuredAlkisParcelIdPropertyKey: string | null
  configuredWfsOutputFormat: string | null
  configuredBboxAxisOrder: "lonlat" | "latlon"
  configuredSupports4326: boolean
  projection: "EPSG:25832" | "EPSG:25833" | null
  capabilities: CapabilitiesSnapshot
}): Promise<ProbeResult> {
  const notes: string[] = []
  const point = STATE_TEST_COORDINATES[params.stateKey]
  if (!point) {
    return {
      ok: false,
      httpStatus: 0,
      supports4326: false,
      chosenOutputFormat: null,
      bboxAxisOrder: null,
      projection: params.projection,
      featureCount: 0,
      detectedParcelIdPropertyKey: null,
      firstFeaturePropertyKeys: [],
      notes,
      error: "No test coordinate configured for state.",
    }
  }

  if (!params.configuredSupports4326) {
    return {
      ok: false,
      httpStatus: 0,
      supports4326: false,
      chosenOutputFormat: getWfsOutputFormat(params.configuredWfsOutputFormat),
      bboxAxisOrder: params.configuredBboxAxisOrder,
      projection: params.projection,
      featureCount: 0,
      detectedParcelIdPropertyKey: params.configuredAlkisParcelIdPropertyKey,
      firstFeaturePropertyKeys: [],
      notes,
      error:
        "Configured supports4326=false. Route currently returns 501 for such states; probe skipped by design.",
    }
  }

  const configuredOutputFormat = getWfsOutputFormat(params.configuredWfsOutputFormat)
  const outputFormats = [configuredOutputFormat]
  if (params.capabilities.outputFormats.includes("application/json")) {
    if (!outputFormats.includes("application/json")) outputFormats.push("application/json")
  }
  const axisOrders: ("lonlat" | "latlon")[] =
    params.configuredBboxAxisOrder === "lonlat" ? ["lonlat", "latlon"] : ["latlon", "lonlat"]
  const delta = PROBE_BBOX_DELTA_DEGREES

  let supports4326 = true
  let lastStatus = 0
  let lastError = "No successful probe response."
  /** HTTP-OK empty responses prove nothing about BBOX axis order; only used if no features were ever seen. */
  let lastEmptyOk: { httpStatus: number; outputFormat: string } | null = null

  for (const outputFormat of outputFormats) {
    for (const axisOrder of axisOrders) {
      const bbox4326 = bboxFromPoint(point.lon, point.lat, delta)
      const [west, south, east, north] = bbox4326
      const url4326 = buildWfsGetFeatureUrl({
        wfsUrl: params.wfsUrl,
        typename: params.typename,
        west,
        south,
        east,
        north,
        count: DEFAULT_COUNT,
        outputFormat,
        bboxAxisOrder: axisOrder,
      })
      const res = await fetchProbe(url4326)
      lastStatus = res.status
      if (!res.ok) {
        lastError = `${res.error ?? "Request failed"} (4326, ${axisOrder}, delta=${delta})`
        continue
      }
      if (looksLikeEmptyWfsFeatureCollection(res.body)) {
        notes.push(
          `Server returned valid empty WFS FeatureCollection for 4326/${axisOrder}/${outputFormat}.`,
        )
        lastEmptyOk = { httpStatus: res.status, outputFormat }
        continue
      }

      const converted = await convertWfsResponseToGeoJson(
        res.body,
        params.label,
        outputFormatLooksJson(outputFormat),
      )
      if (!converted.ok) {
        const reported = parseWfsNumberReturned(res.body)
        if (reported !== null && reported > 0) {
          notes.push(
            `WFS reports numberReturned=${reported} for 4326/${axisOrder}/${outputFormat} but GeoJSON conversion failed; bbox axis order still accepted.`,
          )
          return {
            ok: true,
            httpStatus: res.status,
            supports4326: true,
            chosenOutputFormat: outputFormat,
            bboxAxisOrder: axisOrder,
            projection: params.projection,
            featureCount: reported,
            detectedParcelIdPropertyKey: params.configuredAlkisParcelIdPropertyKey,
            firstFeaturePropertyKeys: [],
            notes,
          }
        }
        lastError = `${converted.error} (4326, ${axisOrder}, ${outputFormat})`
        continue
      }
      const normalized = injectAlkisParcelIdsIntoGeoJson(
        converted.geojson,
        params.configuredAlkisParcelIdPropertyKey,
      )
      if (!normalized.ok) {
        lastError = `${normalized.error} (normalization, 4326, ${axisOrder}, ${outputFormat})`
        continue
      }
      const parsed = JSON.parse(normalized.geojson) as {
        features?: Array<{ properties?: Record<string, unknown> }>
      }
      const features = Array.isArray(parsed.features) ? parsed.features : []
      if (!features.length) {
        notes.push(
          `Valid empty FeatureCollection for 4326/${axisOrder}/${outputFormat} (delta=${delta}).`,
        )
        lastEmptyOk = { httpStatus: res.status, outputFormat }
        continue
      }
      const firstProps = Object.keys(features[0]?.properties ?? {})
      const normalizedSource = String(features[0]?.properties?.alkisParcelIdSource ?? "")
      const normalizedCandidate =
        normalizedSource && normalizedSource !== "none" ? normalizedSource : null
      return {
        ok: true,
        httpStatus: res.status,
        supports4326: true,
        chosenOutputFormat: outputFormat,
        bboxAxisOrder: axisOrder,
        projection: params.projection,
        featureCount: features.length,
        detectedParcelIdPropertyKey:
          normalizedCandidate ??
          detectParcelIdPropertyKey(firstProps) ??
          params.configuredAlkisParcelIdPropertyKey,
        firstFeaturePropertyKeys: firstProps,
        notes,
      }
    }
  }

  if (lastEmptyOk) {
    notes.push(
      "No features at test coordinate after trying output formats and bbox axis orders; keeping configured bboxAxisOrder.",
    )
    return {
      ok: true,
      httpStatus: lastEmptyOk.httpStatus,
      supports4326: true,
      chosenOutputFormat: lastEmptyOk.outputFormat,
      bboxAxisOrder: params.configuredBboxAxisOrder,
      projection: params.projection,
      featureCount: 0,
      detectedParcelIdPropertyKey: params.configuredAlkisParcelIdPropertyKey,
      firstFeaturePropertyKeys: [],
      notes,
    }
  }

  return {
    ok: false,
    httpStatus: lastStatus,
    supports4326,
    chosenOutputFormat: null,
    bboxAxisOrder: null,
    projection: params.projection,
    featureCount: 0,
    detectedParcelIdPropertyKey: null,
    firstFeaturePropertyKeys: [],
    notes,
    error: lastError,
  }
}
