import type { z } from "zod"
import { StateKeyEnum } from "@/src/prisma/generated/client"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import { viewerRoles } from "@/src/server/authorization/constants"
import db from "@/src/server/db.server"
import { NotFoundError } from "@/src/shared/auth/errors"
import { ProjectSlugRequiredSchema } from "@/src/shared/authorization/projectSlugSchema"
import { GetAlkisWfsParcelsSchema } from "./alkis.inputSchemas"
import { alkisStateConfig } from "./alkisStateConfig"
import type { AlkisWfsParcelFeatureCollection } from "./alkisWfsParcelGeoJsonTypes"
import {
  buildWfsGetFeatureUrl,
  convertWfsResponseToGeoJson,
  getWfsOutputFormat,
  injectAlkisParcelIdsIntoGeoJson,
} from "./utils/alkisWfs"

export async function getAlkisWfsParcels(
  headers: Headers,
  input: z.infer<typeof GetAlkisWfsParcelsSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  const [west, south, east, north] = input.bbox
  const project = await db.project.findFirst({
    where: { slug: input.projectSlug },
    select: { alkisStateKey: true },
  })
  if (!project) throw new NotFoundError()

  if (project.alkisStateKey === StateKeyEnum.DISABLED) {
    throw new Error(
      "ALKIS-WFS ist für dieses Projekt nicht konfiguriert (alkisStateKey: DISABLED). Bitte Bundesland in den Projekteinstellungen setzen.",
    )
  }

  const config = alkisStateConfig[project.alkisStateKey]
  if (config.wfs.url === false) {
    throw new Error(
      `ALKIS-WFS für ${config.label} ist nicht verfügbar (kein WFS-Endpunkt konfiguriert).`,
    )
  }

  const wfsUrl = config.wfs.url
  const parcelKey = config.wfs.parcelPropertyKey
  if (!wfsUrl || !parcelKey) {
    throw new Error(
      `ALKIS-WFS für ${config.label} ist nicht verfügbar (kein WFS-Endpunkt konfiguriert).`,
    )
  }

  if (!config.wfs.supports4326) {
    throw new Error(
      `ALKIS-WFS für ${config.label} unterstützt kein EPSG:4326. BBOX-Transformation ist noch nicht implementiert.`,
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
    count: input.count,
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
      throw new Error(
        `WFS-Server ${config.label} (${wfsUrl}) hat nicht innerhalb von 30s geantwortet.`,
      )
    }
    const msg = e instanceof Error ? e.message : String(e)
    throw new Error(`WFS-Anfrage an ${config.label} fehlgeschlagen: ${msg}`)
  } finally {
    clearTimeout(timeoutId)
  }

  if (!res.ok) {
    throw new Error(
      `WFS-Server ${config.label} (${wfsUrl}) antwortet mit HTTP ${res.status}: ${res.statusText}`,
    )
  }

  const bodyText = await res.text()
  if (bodyText.includes("<ExceptionReport")) {
    const compact = bodyText.replace(/\s+/g, " ").slice(0, 240)
    throw new Error(
      `WFS-Server ${config.label} (${wfsUrl}) lieferte eine OGC Exception: ${compact}`,
    )
  }

  const converted = await convertWfsResponseToGeoJson(
    bodyText,
    config.label,
    config.wfs.wfsSupportsJson,
  )
  if (!converted.ok) throw new Error(converted.error)

  const normalized = injectAlkisParcelIdsIntoGeoJson(
    converted.geojson,
    config.wfs.alkisParcelIdPropertyKey,
  )
  if (!normalized.ok) throw new Error(normalized.error)

  return JSON.parse(normalized.geojson) as AlkisWfsParcelFeatureCollection
}

export async function getAlkisAttributionByProject(
  headers: Headers,
  input: z.infer<typeof ProjectSlugRequiredSchema>,
) {
  await endpointAuth.projectRole(headers, input.projectSlug, viewerRoles)
  const project = await db.project.findFirst({
    where: { slug: input.projectSlug },
    select: { alkisStateKey: true },
  })
  if (!project) throw new NotFoundError()

  const stateConfig = alkisStateConfig[project.alkisStateKey]
  if (stateConfig.enabled !== true) return null

  return stateConfig.attribution
}
