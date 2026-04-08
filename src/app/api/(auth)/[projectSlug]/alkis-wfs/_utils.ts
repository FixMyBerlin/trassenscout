import type { AlkisBackgroundConfigEntry } from "@/src/core/components/Map/alkisStateConfig"
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

export function getWfsOutputFormat(config: AlkisBackgroundConfigEntry): string {
  return config.jsonOutputFormat?.trim() ? config.jsonOutputFormat.trim() : GML_OUTPUT_FORMAT
}

export async function convertGmlToGeoJson(
  gmlContent: string,
  label: string,
): Promise<{ ok: true; geojson: string } | { ok: false; stderr: string }> {
  const name = `alkis-wfs-${randomBytes(8).toString("hex")}.gml`
  const gmlPath = join(tmpdir(), name)
  try {
    await writeFile(gmlPath, gmlContent, "utf8")
    const { stdout, stderr } = await execFileAsync(
      "ogr2ogr",
      ["-f", "GeoJSON", "/vsistdout/", gmlPath, "-t_srs", "EPSG:4326"],
      { maxBuffer: 80 * 1024 * 1024 },
    )
    if (stderr?.trim()) {
      console.warn(`ogr2ogr stderr (${label}):`, stderr.trim())
    }
    if (!stdout.trim()) {
      // Some WFS/GML drivers emit empty stdout for valid empty result sets.
      return { ok: true, geojson: JSON.stringify({ type: "FeatureCollection", features: [] }) }
    }
    return { ok: true, geojson: stdout }
  } catch (e) {
    const stderr =
      e && typeof e === "object" && "stderr" in e
        ? String((e as { stderr?: Buffer }).stderr ?? "")
        : e instanceof Error
          ? e.message
          : String(e)
    return { ok: false, stderr }
  } finally {
    await unlink(gmlPath).catch(() => {})
  }
}

export function parseAndValidateFeatureCollectionJson(raw: string, label: string) {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw) as unknown
  } catch {
    return {
      ok: false as const,
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
      ok: false as const,
      error: `WFS ${label} lieferte kein gültiges GeoJSON (erwartet FeatureCollection, erhalten: ${t})`,
    }
  }
  return { ok: true as const, featureCollection: parsed }
}
