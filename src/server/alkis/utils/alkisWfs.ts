import type { Feature, FeatureCollection, Geometry } from "geojson"
import { execFile } from "node:child_process"
import { randomBytes } from "node:crypto"
import { unlink, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

// Avoid "+" in MIME type because some WFS implementations decode it as whitespace.
const GML_OUTPUT_FORMAT = "text/xml; subtype=gml/3.2.1"

export function buildWfsGetFeatureUrl(params: {
  wfsUrl: string
  typename: string
  west: number
  south: number
  east: number
  north: number
  count: number
  outputFormat: string
  bboxAxisOrder: "lonlat" | "latlon"
}): string {
  const url = new URL(params.wfsUrl)
  url.searchParams.set("SERVICE", "WFS")
  url.searchParams.set("VERSION", "2.0.0")
  url.searchParams.set("REQUEST", "GetFeature")
  url.searchParams.set("TYPENAMES", params.typename)
  url.searchParams.set("SRSNAME", "EPSG:4326")
  const bbox =
    params.bboxAxisOrder === "latlon"
      ? `${params.south},${params.west},${params.north},${params.east},EPSG:4326`
      : `${params.west},${params.south},${params.east},${params.north},EPSG:4326`
  url.searchParams.set("BBOX", bbox)
  url.searchParams.set("COUNT", String(params.count))
  url.searchParams.set("OUTPUTFORMAT", params.outputFormat)
  return url.toString()
}

export function getWfsOutputFormat(wfsOutputFormat: string | null | undefined) {
  return wfsOutputFormat?.trim() ? wfsOutputFormat.trim() : GML_OUTPUT_FORMAT
}

function sniffTempExtension(body: string): string {
  const t = body.trimStart()
  if (t.startsWith("<")) return ".gml"
  if (t.startsWith("{") || t.startsWith("[")) return ".json"
  return ".dat"
}

function tryJsonFeatureCollectionFastPath(
  raw: string,
): { ok: true; geojson: string } | { ok: false } {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw) as unknown
  } catch {
    return { ok: false }
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("type" in parsed) ||
    (parsed as { type?: unknown }).type !== "FeatureCollection"
  ) {
    return { ok: false }
  }
  return { ok: true, geojson: JSON.stringify(parsed) }
}

function validateFeatureCollectionJson(
  raw: string,
  label: string,
): { ok: true; geojson: string } | { ok: false; error: string } {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw) as unknown
  } catch {
    return {
      ok: false,
      error: `WFS ${label} lieferte kein gültiges JSON.`,
    }
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("type" in parsed) ||
    (parsed as { type?: unknown }).type !== "FeatureCollection"
  ) {
    const t =
      parsed && typeof parsed === "object" && "type" in parsed
        ? String((parsed as { type: unknown }).type)
        : typeof parsed
    return {
      ok: false,
      error: `WFS ${label} lieferte kein gültiges GeoJSON (erwartet FeatureCollection, erhalten: ${t})`,
    }
  }
  return { ok: true, geojson: JSON.stringify(parsed) }
}

/**
 * Parses a WFS GetFeature response as GeoJSON FeatureCollection.
 * Tries JSON first; otherwise writes a temp file and runs ogr2ogr (GDAL format auto-detection).
 */
export async function convertWfsResponseToGeoJson(
  bodyText: string,
  label: string,
): Promise<{ ok: true; geojson: string } | { ok: false; error: string }> {
  const fast = tryJsonFeatureCollectionFastPath(bodyText)
  if (fast.ok) {
    return fast
  }

  const ext = sniffTempExtension(bodyText)
  const name = `alkis-wfs-${randomBytes(8).toString("hex")}${ext}`
  const tempPath = join(tmpdir(), name)
  try {
    await writeFile(tempPath, bodyText, "utf8")
    const { stdout, stderr } = await execFileAsync(
      "ogr2ogr",
      ["-f", "GeoJSON", "/vsistdout/", tempPath, "-t_srs", "EPSG:4326"],
      { maxBuffer: 80 * 1024 * 1024 },
    )
    if (stderr?.trim()) {
      console.warn(`ogr2ogr stderr (${label}):`, stderr.trim())
    }
    const out = stdout.trim() ? stdout : JSON.stringify({ type: "FeatureCollection", features: [] })
    return validateFeatureCollectionJson(out, label)
  } catch (e) {
    const stderr =
      e && typeof e === "object" && "stderr" in e
        ? String((e as { stderr?: Buffer }).stderr ?? "")
        : e instanceof Error
          ? e.message
          : String(e)
    return {
      ok: false,
      error: `Konvertierung zu GeoJSON via ogr2ogr fehlgeschlagen für ${label}: ${stderr}`,
    }
  } finally {
    await unlink(tempPath).catch(() => {})
  }
}

function stringifyFeatureId(v: unknown) {
  if (v == null) return ""
  if (typeof v === "string") return v.trim()
  if (typeof v === "number" || typeof v === "boolean") return String(v)
  return ""
}

function resolveAlkisParcelId(feature: Feature<Geometry>, configuredKey: string | null) {
  const props = (feature.properties ?? {}) as Record<string, unknown>
  const key = configuredKey?.trim()

  if (key) {
    const fromKey = stringifyFeatureId(props[key])
    if (fromKey) return { alkisParcelId: fromKey, alkisParcelIdSource: key }
  }

  const fromFs = stringifyFeatureId(props.flurstueckskennzeichen)
  if (fromFs) return { alkisParcelId: fromFs, alkisParcelIdSource: "flurstueckskennzeichen" }

  const fromGml = stringifyFeatureId(props.gml_id)
  if (fromGml) return { alkisParcelId: fromGml, alkisParcelIdSource: "gml_id" }

  if (feature.id !== undefined && feature.id !== null) {
    const fromId = stringifyFeatureId(feature.id as unknown)
    if (fromId) return { alkisParcelId: fromId, alkisParcelIdSource: "feature.id" }
  }

  return { alkisParcelId: null, alkisParcelIdSource: "none" }
}

/**
 * Adds normalized `alkisParcelId` and `alkisParcelIdSource` to every feature (see plan: Flurstückskennzeichen).
 */
export function injectAlkisParcelIdsIntoGeoJson(
  geojsonString: string,
  alkisParcelIdPropertyKey: string | null,
) {
  let parsed: unknown
  try {
    parsed = JSON.parse(geojsonString) as unknown
  } catch {
    return { ok: false as const, error: "GeoJSON konnte nicht geparst werden." }
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("type" in parsed) ||
    (parsed as { type?: unknown }).type !== "FeatureCollection"
  ) {
    return { ok: false as const, error: "Erwartet wurde eine GeoJSON FeatureCollection." }
  }
  const fc = parsed as FeatureCollection<Geometry>
  const features = Array.isArray(fc.features) ? fc.features : []
  for (const f of features) {
    if (!f || f.type !== "Feature") continue
    const { alkisParcelId, alkisParcelIdSource } = resolveAlkisParcelId(f, alkisParcelIdPropertyKey)
    f.properties = { ...(f.properties ?? {}), alkisParcelId, alkisParcelIdSource }
  }
  return { ok: true as const, geojson: JSON.stringify(parsed) }
}
