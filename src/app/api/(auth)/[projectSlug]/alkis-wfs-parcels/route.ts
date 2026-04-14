import db from "@/db"
import { alkisStateConfig } from "@/src/app/api/(auth)/[projectSlug]/alkis-wfs-parcels/_utils/alkisStateConfig"
import { withProjectMembership } from "@/src/app/api/(auth)/_utils/withProjectMembership"
import { viewerRoles } from "@/src/authorization/constants"
import { StateKeyEnum } from "@prisma/client"
import {
  buildWfsGetFeatureUrl,
  convertWfsResponseToGeoJson,
  getWfsOutputFormat,
  injectAlkisParcelIdsIntoGeoJson,
} from "./_utils/helper"

// opts into Node runtime (Edge cannot spawn ogr2ogr like this)
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
  if (config.wfs.url === false) {
    return jsonError(
      `ALKIS-WFS für ${config.label} ist nicht verfügbar (kein WFS-Endpunkt konfiguriert).`,
      400,
    )
  }

  const wfsUrl = config.wfs.url.trim()
  const parcelKey = config.wfs.parcelPropertyKey.trim()
  if (!wfsUrl || !parcelKey) {
    return jsonError(
      `ALKIS-WFS für ${config.label} ist nicht verfügbar (kein WFS-Endpunkt konfiguriert).`,
      400,
    )
  }

  if (!config.wfs.supports4326) {
    return jsonError(
      `ALKIS-WFS für ${config.label} unterstützt kein EPSG:4326. BBOX-Transformation ist noch nicht implementiert.`,
      501,
    )
  }

  const outputFormat = getWfsOutputFormat(config.wfs.wfsOutputFormat)

  const getFeatureUrl = buildWfsGetFeatureUrl({
    wfsUrl,
    typename: parcelKey,
    west,
    south,
    east,
    north,
    count,
    outputFormat,
    bboxAxisOrder: config.wfs.bboxAxisOrder,
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

  const converted = await convertWfsResponseToGeoJson(bodyText, config.label)
  if (!converted.ok) {
    return jsonError(converted.error, 500)
  }

  const normalized = injectAlkisParcelIdsIntoGeoJson(
    converted.geojson,
    config.wfs.alkisParcelIdPropertyKey,
  )
  if (!normalized.ok) {
    return jsonError(normalized.error, 500)
  }

  return new Response(normalized.geojson, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
})
