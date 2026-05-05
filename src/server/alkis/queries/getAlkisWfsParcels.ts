import db from "@/db"
import { authorizeProjectMember } from "@/src/authorization/authorizeProjectMember"
import { viewerRoles } from "@/src/authorization/constants"
import {
  extractProjectSlug,
  ProjectSlugRequiredSchema,
} from "@/src/authorization/extractProjectSlug"
import { alkisStateConfig } from "@/src/server/alkis/alkisStateConfig"
import type { AlkisWfsParcelFeatureCollection } from "@/src/server/alkis/alkisWfsParcelGeoJsonTypes"
import {
  buildWfsGetFeatureUrl,
  convertWfsResponseToGeoJson,
  getWfsOutputFormat,
  injectAlkisParcelIdsIntoGeoJson,
} from "@/src/server/alkis/utils/alkisWfs"
import { resolver } from "@blitzjs/rpc"
import { StateKeyEnum } from "@prisma/client"
import { NotFoundError } from "blitz"
import { z } from "zod"

const GetAlkisWfsParcelsSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    count: z.number().int().min(1).max(10_000).default(5000),
  }),
)

export default resolver.pipe(
  resolver.zod(GetAlkisWfsParcelsSchema),
  authorizeProjectMember(extractProjectSlug, viewerRoles),
  async ({ projectSlug, bbox, count }) => {
    const [west, south, east, north] = bbox

    const project = await db.project.findFirst({
      where: { slug: projectSlug },
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
    if (!converted.ok) {
      throw new Error(converted.error)
    }

    const normalized = injectAlkisParcelIdsIntoGeoJson(
      converted.geojson,
      config.wfs.alkisParcelIdPropertyKey,
    )
    if (!normalized.ok) {
      throw new Error(normalized.error)
    }

    return JSON.parse(normalized.geojson) as AlkisWfsParcelFeatureCollection
  },
)
