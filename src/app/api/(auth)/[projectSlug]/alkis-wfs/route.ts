import db from "@/db"
import { withProjectMembership } from "@/src/app/api/(auth)/_utils/withProjectMembership"
import { viewerRoles } from "@/src/authorization/constants"
import { alkisStateConfig } from "@/src/core/components/Map/alkisStateConfig"
import { StateKeyEnum } from "@prisma/client"
import {
  buildWfsGetFeatureUrl,
  convertGmlToGeoJson,
  getWfsOutputFormat,
  parseAndValidateFeatureCollectionJson,
} from "./_utils"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export const GET = withProjectMembership(viewerRoles, async ({ params, request }) => {
  const { projectSlug } = params
  const url = new URL(request.url)
  const bboxRaw = url.searchParams.get("bbox")
  if (bboxRaw == null || bboxRaw.trim() === "") {
    return jsonError(
      "bbox Query-Parameter fehlt. Erwartet: bbox=west,south,east,north (EPSG:4326)",
      400,
    )
  }

  const parts = bboxRaw.split(",").map((s) => s.trim())
  if (parts.length !== 4) {
    return jsonError(
      `bbox muss 4 kommagetrennte Zahlen enthalten (west,south,east,north). Erhalten: '${bboxRaw}'`,
      400,
    )
  }
  const nums = parts.map((p) => Number(p))
  if (nums.some((n) => !Number.isFinite(n))) {
    return jsonError(
      `bbox muss 4 kommagetrennte Zahlen enthalten (west,south,east,north). Erhalten: '${bboxRaw}'`,
      400,
    )
  }
  const [west, south, east, north] = nums as [number, number, number, number]

  const countRaw = url.searchParams.get("count")
  const count = countRaw == null ? 1000 : Number(countRaw)
  if (!Number.isFinite(count) || count < 1 || count > 10_000) {
    return jsonError("count muss eine Zahl zwischen 1 und 10000 sein.", 400)
  }

  const project = await db.project.findFirst({
    where: { slug: projectSlug },
    select: { alkisStateKey: true },
  })
  if (!project) {
    return jsonError("Projekt nicht gefunden.", 404)
  }

  if (project.alkisStateKey === StateKeyEnum.DISABLED) {
    return jsonError(
      "ALKIS-WFS ist für dieses Projekt nicht konfiguriert (alkisStateKey: DISABLED). Bitte Bundesland in den Projekteinstellungen setzen.",
      400,
    )
  }

  const config = alkisStateConfig[project.alkisStateKey]
  const wfsUrl = config.wfsUrl?.trim()
  const parcelKey = config.parcelPropertyKey?.trim()
  if (!wfsUrl || !parcelKey) {
    return jsonError(
      `ALKIS-WFS für ${config.label} ist nicht verfügbar (kein WFS-Endpunkt konfiguriert).`,
      400,
    )
  }

  if (!config.supports4326) {
    return jsonError(
      `ALKIS-WFS für ${config.label} unterstützt kein EPSG:4326. BBOX-Transformation ist noch nicht implementiert.`,
      501,
    )
  }

  const layerParam = url.searchParams.get("layer")?.trim()
  const typename = layerParam || parcelKey
  const outputFormat = getWfsOutputFormat(config)

  const getFeatureUrl = buildWfsGetFeatureUrl({
    wfsUrl,
    typename,
    west,
    south,
    east,
    north,
    count,
    outputFormat,
    bboxAxisOrder: config.bboxAxisOrder,
  })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30_000)

  let res: Response
  try {
    res = await fetch(getFeatureUrl, {
      signal: controller.signal,
      headers: { Accept: "*/*" },
    })
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      return jsonError(
        `WFS-Server ${config.label} (${wfsUrl}) hat nicht innerhalb von 30s geantwortet.`,
        504,
      )
    }
    const msg = e instanceof Error ? e.message : String(e)
    return jsonError(`WFS-Anfrage an ${config.label} fehlgeschlagen: ${msg}`, 502)
  } finally {
    clearTimeout(timeoutId)
  }

  if (!res.ok) {
    return jsonError(
      `WFS-Server ${config.label} (${wfsUrl}) antwortet mit HTTP ${res.status}: ${res.statusText}`,
      502,
    )
  }

  const bodyText = await res.text()

  if (bodyText.includes("<ExceptionReport")) {
    const compact = bodyText.replace(/\s+/g, " ").slice(0, 240)
    return jsonError(
      `WFS-Server ${config.label} (${wfsUrl}) lieferte eine OGC Exception: ${compact}`,
      502,
    )
  }

  if (config.jsonOutputFormat?.trim()) {
    const validation = parseAndValidateFeatureCollectionJson(bodyText, config.label)
    if (!validation.ok) {
      return jsonError(validation.error, 500)
    }
    return new Response(JSON.stringify(validation.featureCollection), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  const converted = await convertGmlToGeoJson(bodyText, config.label)
  if (!converted.ok) {
    return jsonError(
      `GML-zu-GeoJSON-Konvertierung via ogr2ogr fehlgeschlagen für ${config.label}: ${converted.stderr}`,
      500,
    )
  }

  const validation = parseAndValidateFeatureCollectionJson(converted.geojson, config.label)
  if (!validation.ok) {
    return jsonError(validation.error, 500)
  }

  return new Response(JSON.stringify(validation.featureCollection), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
})
