#!/usr/bin/env bun
/**
 * Discovers WMS GetCapabilities per Bundesland (configured wmsUrl or derived from wfsUrl),
 * extracts CRS/SRS + layer names (regex only), writes markdown report.
 *
 * Run: bun scripts/alkis-wms-audit.ts
 */

import { writeFileSync } from "node:fs"
import { join } from "node:path"
import { StateKeyEnum } from "@prisma/client"
import {
  alkisStateConfig,
  type AlkisBackgroundConfigEntry,
} from "../src/core/components/Map/alkisStateConfig"

const FETCH_TIMEOUT_MS = 45_000

/** Avoid embedding binary error bodies (e.g. JPEG 404 pages) in markdown. */
function sanitizeReportText(s: string, maxLen = 400): string {
  const noNull = s.replace(/\0/g, "")
  if (/JFIF|^\s*\xff\xd8\xff/i.test(noNull)) {
    return "non-text body (binary image or similar)"
  }
  const printable = noNull.replace(/[^\x09\x0a\x0d\x20-\x7E\u00A0-\uFFFF]/g, " ")
  const oneLine = printable.replace(/\s+/g, " ").trim()
  return oneLine.length <= maxLen ? oneLine : `${oneLine.slice(0, maxLen)}...`
}

type WmsVersion = "1.3.0" | "1.1.1"

type ParsedWmsCaps = {
  version: WmsVersion
  crsList: string[]
  layerNames: { name: string; title: string }[]
  error?: string
}

type AuditRow = {
  key: StateKeyEnum
  label: string
  wfsUrl: string
  configuredWmsUrl?: string
  attempts: { url: string; version: WmsVersion; httpStatus: number; error?: string }[]
  /** Only set when GetCapabilities succeeded for this exact URL. */
  verifiedWmsUrl?: string
  verifiedVersion?: WmsVersion
  httpStatus: number
  ok: boolean
  error?: string
  crsListSample: string[]
  supports3857: boolean
  webMercatorOnly900913: boolean
  crsNote: string
  only25832Or33: boolean
  layerNamesAll: { name: string; title: string }[]
  layerNameChosen?: string
  urlSource?: "configured" | "derived"
}

const ALKIS_LAYER_HINT =
  /flurstueck|flurstück|cadastral|parcel|kataster|alkis|grundst/i

function stripStyleBlocks(s: string): string {
  return s.replace(/<(?:[\w.]+:)?Style\b[^>]*>[\s\S]*?<\/(?:[\w.]+:)?Style>/gi, "")
}

/** Bun scripts do not expose DOMParser; use regex extraction for predictable WMS Capabilities XML. */
function parseWmsCapabilitiesXml(xml: string, version: WmsVersion): ParsedWmsCaps {
  const trimmed = xml.trim()
  if (!trimmed.startsWith("<")) {
    return { version, crsList: [], layerNames: [], error: "Response is not XML" }
  }

  const isWmsRoot =
    /<(?:[\w.]+:)?WMS_Capabilities\b/i.test(trimmed) ||
    /<WMT_MS_Capabilities\b/i.test(trimmed)
  if (!isWmsRoot) {
    return {
      version,
      crsList: [],
      layerNames: [],
      error: "Root element is not WMS Capabilities",
    }
  }

  const capM = trimmed.match(
    /<(?:[\w.]+:)?Capability\b[^>]*>([\s\S]*)<\/(?:[\w.]+:)?Capability>/i,
  )
  const capInner = stripStyleBlocks(capM?.[1] ?? trimmed)

  const crsList: string[] = []
  const tag = version === "1.3.0" ? "CRS" : "SRS"
  const crsRe = new RegExp(
    `<(?:[\\w.]+:)?${tag}\\b[^>]*>([^<]*)</(?:[\\w.]+:)?${tag}>`,
    "gi",
  )
  let cm: RegExpExecArray | null
  while ((cm = crsRe.exec(trimmed)) !== null) {
    const t = cm[1]?.trim()
    if (t) crsList.push(t)
  }

  const nameRe = /<(?:[\w.]+:)?Name\b[^>]*>([^<]*)<\/(?:[\w.]+:)?Name>/gi
  const titleRe = /<(?:[\w.]+:)?Title\b[^>]*>([^<]*)<\/(?:[\w.]+:)?Title>/gi
  const titles: string[] = []
  let tm: RegExpExecArray | null
  while ((tm = titleRe.exec(capInner)) !== null) {
    titles.push(tm[1]?.trim() ?? "")
  }

  const names: string[] = []
  let nm: RegExpExecArray | null
  while ((nm = nameRe.exec(capInner)) !== null) {
    const n = nm[1]?.trim()
    if (n) names.push(n)
  }

  const layerNames: { name: string; title: string }[] = []
  const seen = new Set<string>()
  for (let i = 0; i < names.length; i++) {
    const name = names[i] ?? ""
    if (!name || name.toLowerCase() === "default") continue
    const title = titles[i] ?? ""
    if (!seen.has(name)) {
      seen.add(name)
      layerNames.push({ name, title })
    }
  }

  if (!crsList.length && !layerNames.length) {
    return {
      version,
      crsList: [],
      layerNames: [],
      error: "Could not parse CRS/SRS or Layer names (unexpected XML shape?)",
    }
  }

  return { version, crsList: [...new Set(crsList)], layerNames }
}

/** Web Mercator: EPSG:3857 or legacy EPSG:900913 (MapLibre uses EPSG:3857 for the view). */
function crsList3857Hints(crsStrings: string[]): {
  supports3857: boolean
  only900913: boolean
} {
  let has3857 = false
  let has900913 = false
  for (const s of crsStrings) {
    if (!s) continue
    if (
      s.includes("EPSG::3857") ||
      /EPSG:3857\b/i.test(s) ||
      /\/EPSG\/0\/3857\b/i.test(s) ||
      /def\/crs\/EPSG\/0\/3857/i.test(s) ||
      /urn:ogc:def:crs:EPSG::3857/i.test(s) ||
      /urn:x-ogc:def:crs:EPSG::3857/i.test(s)
    ) {
      has3857 = true
    }
    if (
      s.includes("EPSG::900913") ||
      /EPSG:900913\b/i.test(s) ||
      /\/EPSG\/0\/900913\b/i.test(s) ||
      /def\/crs\/EPSG\/0\/900913/i.test(s)
    ) {
      has900913 = true
    }
  }
  const supports3857 = has3857 || has900913
  const only900913 = !has3857 && has900913
  return { supports3857, only900913 }
}

function onlyEpsg25832Or33(crsStrings: string[]): boolean {
  const has25832 = crsStrings.some((s) => /EPSG:25832|25832/i.test(s))
  const has25833 = crsStrings.some((s) => /EPSG:25833|25833/i.test(s))
  const hasOther =
    crsStrings.some((s) => /EPSG:(?!25832|25833)\d+/i.test(s)) ||
    crsStrings.some((s) => /CRS84|4326|3857|900913/i.test(s))
  return (has25832 || has25833) && !hasOther && crsStrings.length > 0
}

function pickLayerNames(layers: { name: string; title: string }[]): string[] {
  const scored = layers.filter(
    (l) =>
      ALKIS_LAYER_HINT.test(l.name) ||
      ALKIS_LAYER_HINT.test(l.title),
  )
  const pool = scored.length ? scored : layers
  return pool.map((l) => l.name)
}

function wmsGetCapabilitiesUrl(baseUrl: string, version: WmsVersion): string {
  const u = new URL(baseUrl)
  u.searchParams.set("SERVICE", "WMS")
  u.searchParams.set("REQUEST", "GetCapabilities")
  u.searchParams.set("VERSION", version)
  return u.toString()
}

/** Ordered unique candidates from WFS URL heuristics (document each attempt in report). */
function deriveWmsCandidatesFromWfs(wfsUrl: string): string[] {
  const base = wfsUrl.trim()
  const out: string[] = []
  const push = (s: string) => {
    const t = s.trim()
    if (!t || t === base) return
    if (!out.includes(t)) out.push(t)
  }

  const chain = base
    .replace(/www\.wfs\./gi, "www.wms.")
    .replace(/\/registry\/wfs\//gi, "/registry/wms/")
    .replace(/\/wfs\//gi, "/wms/")
    .replace(/\/wfs_nw_/gi, "/wms_nw_")
    .replace(/wfs_nw_alkis_vereinfacht/gi, "wms_nw_alkis")
    .replace(/_wfs_/gi, "_wms_")
    .replace(/\/wfs$/gi, "/wms")
    .replace(/_wfs$/gi, "_wms")
    .replace(/WFS_/g, "WMS_")
    .replace(/wfs2/gi, "wms")
  push(chain)

  push(base.replace(/www\.wfs\./gi, "www.wms."))
  push(base.replace(/\/registry\/wfs\//gi, "/registry/wms/"))
  push(base.replace(/\/wfs\//gi, "/wms/"))
  push(base.replace(/\/wfs_nw_/gi, "/wms_nw/"))
  push(base.replace(/wfs_nw_alkis_vereinfacht/gi, "wms_nw_alkis"))
  push(base.replace(/_wfs_/gi, "_wms_"))
  push(base.replace(/WFS_/g, "WMS_"))
  push(base.replace(/wfs2/gi, "wms"))
  push(base.replace(/\/wfs$/gi, "/wms"))
  push(base.replace(/_wfs$/gi, "_wms"))

  const reg = base.match(/^(https?:\/\/[^?]+?)\/registry\/wfs\/(\d+)/i)
  if (reg) {
    push(`${reg[1]}/registry/wms/${reg[2]}`)
  }

  return out
}

async function fetchCapabilities(
  baseUrl: string,
): Promise<{
  ok: boolean
  httpStatus: number
  xml: string
  version: WmsVersion
  error?: string
}> {
  const versions: WmsVersion[] = ["1.3.0", "1.1.1"]
  let lastStatus = 0
  let lastErr = ""
  for (const version of versions) {
    const url = wmsGetCapabilitiesUrl(baseUrl, version)
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/xml, text/xml, */*" },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      })
      lastStatus = res.status
      const xml = await res.text()
      if (!res.ok) {
        lastErr = `HTTP ${res.status}: ${sanitizeReportText(xml, 220)}`
        continue
      }
      const parsed = parseWmsCapabilitiesXml(xml, version)
      if (parsed.error) {
        lastErr = parsed.error
        continue
      }
      return { ok: true, httpStatus: res.status, xml, version }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      lastErr = msg
    }
  }
  return {
    ok: false,
    httpStatus: lastStatus,
    xml: "",
    version: "1.3.0",
    error: lastErr || "GetCapabilities failed",
  }
}

async function auditOne(
  key: StateKeyEnum,
  entry: AlkisBackgroundConfigEntry,
): Promise<AuditRow> {
  const wfsUrl = entry.wfsUrl?.trim() ?? ""
  const configuredWms = entry.wmsUrl?.trim()

  const base: Omit<
    AuditRow,
    | "attempts"
    | "httpStatus"
    | "ok"
    | "crsListSample"
    | "supports3857"
    | "webMercatorOnly900913"
    | "crsNote"
    | "only25832Or33"
    | "layerNamesAll"
    | "error"
  > = {
    key,
    label: entry.label,
    wfsUrl,
    configuredWmsUrl: configuredWms || undefined,
  }

  const attempts: AuditRow["attempts"] = []

  const candidates: { url: string; source: "configured" | "derived" }[] = []
  if (configuredWms) {
    candidates.push({ url: configuredWms, source: "configured" })
  }
  if (wfsUrl) {
    for (const u of deriveWmsCandidatesFromWfs(wfsUrl)) {
      const already = candidates.some((c) => c.url === u)
      if (!already) {
        candidates.push({ url: u, source: "derived" })
      }
    }
  }

  if (!candidates.length) {
    return {
      ...base,
      attempts,
      httpStatus: 0,
      ok: false,
      error: wfsUrl
        ? "no WMS candidate URL differs from WFS URL after derivation rules (nothing to try)"
        : "no wmsUrl and no wfsUrl to derive from",
      crsListSample: [],
      supports3857: false,
      webMercatorOnly900913: false,
      crsNote: "-",
      only25832Or33: false,
      layerNamesAll: [],
    }
  }

  for (const { url, source } of candidates) {
    const res = await fetchCapabilities(url)
    attempts.push({
      url,
      version: res.version,
      httpStatus: res.httpStatus,
      error: res.ok ? undefined : res.error,
    })

    if (!res.ok || !res.xml) {
      continue
    }

    const parsed = parseWmsCapabilitiesXml(res.xml, res.version)
    if (parsed.error) {
      attempts[attempts.length - 1]!.error = parsed.error
      continue
    }

    const crsList = parsed.crsList
    const { supports3857, only900913 } = crsList3857Hints(crsList)
    const only32_33 = !supports3857 && onlyEpsg25832Or33(crsList)
    let crsNote = "mixed/other"
    if (only32_33) crsNote = "only EPSG:25832/25833 (no 3857 in parsed list)"
    else if (!supports3857) crsNote = "no Web Mercator (3857/900913) in parsed list"
    else if (only900913) crsNote = "yes (900913)"
    else crsNote = "yes (EPSG:3857)"

    const chosen = pickLayerNames(parsed.layerNames)
    const layerNameChosen =
      chosen.length > 0 ? chosen.join(",") : undefined

    return {
      ...base,
      attempts,
      verifiedWmsUrl: url,
      verifiedVersion: res.version,
      urlSource: source,
      httpStatus: res.httpStatus,
      ok: true,
      crsListSample: crsList.slice(0, 24),
      supports3857,
      webMercatorOnly900913: only900913,
      crsNote,
      only25832Or33: only32_33,
      layerNamesAll: parsed.layerNames.slice(0, 40),
      layerNameChosen,
    }
  }

  const last = attempts[attempts.length - 1]
  return {
    ...base,
    attempts,
    httpStatus: last?.httpStatus ?? 0,
    ok: false,
    error: last?.error ?? "WMS URL not discoverable from config / WFS-derived candidates",
    crsListSample: [],
    supports3857: false,
    webMercatorOnly900913: false,
    crsNote: "-",
    only25832Or33: false,
    layerNamesAll: [],
  }
}

function format3857Cell(r: AuditRow): string {
  if (!r.ok) return "-"
  if (!r.supports3857) return "no"
  if (r.webMercatorOnly900913) return "yes (900913)"
  return "yes"
}

function markdownSummaryTable(rows: AuditRow[]): string {
  const header =
    "| Bundesland | WMS URL (source) | HTTP | OK | Version | 3857 | CRS note | layerName |"
  const sep = "|---|---|---:|:---:|---|:---:|---|---|"
  const lines = rows.map((r) => {
    const src = r.verifiedWmsUrl
      ? r.urlSource === "configured"
        ? "configured"
        : "derived"
      : "-"
    const urlCell = r.verifiedWmsUrl
      ? `\`${r.verifiedWmsUrl.slice(0, 72)}${r.verifiedWmsUrl.length > 72 ? "..." : ""}\` (${src})`
      : "-"
    const ver = r.verifiedVersion ?? "-"
    const c3857 = format3857Cell(r)
    const layers = r.layerNameChosen ?? "-"
    return `| ${r.label} | ${urlCell} | ${r.httpStatus || "-"} | ${r.ok ? "yes" : "no"} | ${ver} | ${c3857} | ${r.crsNote} | ${layers} |`
  })
  const footnote =
    "\n\n*EPSG:3857: Web Mercator for MapLibre tile grid; `yes (900913)` means capabilities list EPSG:900913 (equivalent projection).*"
  return [header, sep, ...lines].join("\n") + footnote
}

function detailSection(r: AuditRow): string {
  const parts = [`### ${r.label} (\`${r.key}\`)`, ""]
  parts.push(`- **WFS URL:** ${r.wfsUrl || "-"}`)
  parts.push(`- **Configured wmsUrl (before audit):** ${r.configuredWmsUrl ?? "-"}`)
  parts.push("- **Candidate attempts:**")
  for (const a of r.attempts) {
    const err = a.error ? ` - ${a.error}` : ""
    parts.push(
      `  - \`${a.url.slice(0, 96)}${a.url.length > 96 ? "..." : ""}\` -> VERSION=${a.version} HTTP ${a.httpStatus}${err}`,
    )
  }
  if (r.error) parts.push(`- **Outcome error:** ${r.error}`)
  parts.push(`- **Verified WMS base URL:** ${r.verifiedWmsUrl ?? "-"}`)
  parts.push(`- **HTTP:** ${r.httpStatus || "-"}`)
  parts.push(`- **EPSG:3857 / Web Mercator:** ${format3857Cell(r)}`)
  parts.push(`- **CRS list (sample, parsed):** ${r.crsListSample.length ? r.crsListSample.join(", ") : "-"}`)
  if (r.layerNamesAll.length) {
    const preview = r.layerNamesAll
      .slice(0, 15)
      .map((l) => `${l.name}${l.title ? ` (${l.title})` : ""}`)
    parts.push(
      `- **Layers (first 15):** ${preview.join("; ")}${r.layerNamesAll.length > 15 ? "; ..." : ""}`,
    )
  } else {
    parts.push("- **Layers (first 15):** -")
  }
  parts.push(`- **Chosen layerName:** ${r.layerNameChosen ?? "-"}`)
  parts.push("")
  return parts.join("\n")
}

async function main() {
  const entries = Object.entries(alkisStateConfig).filter(
    ([k, v]) =>
      k !== StateKeyEnum.DISABLED &&
      (v.wfsUrl?.trim() || v.wmsUrl?.trim()),
  ) as [StateKeyEnum, AlkisBackgroundConfigEntry][]

  const rows: AuditRow[] = []
  for (const [key, entry] of entries) {
    process.stderr.write(`WMS audit ${key}...\n`)
    rows.push(await auditOne(key, entry))
  }

  const notFound = rows.filter((r) => !r.ok && !r.error?.includes("no wmsUrl"))
  const notVerified = rows.filter((r) => !r.ok)

  const generatedAt = new Date().toISOString()
  const md = [
    "# ALKIS WMS GetCapabilities audit",
    "",
    `Generated: ${generatedAt}`,
    "",
    "Request: `SERVICE=WMS&REQUEST=GetCapabilities` with **VERSION=1.3.0**, then **1.1.1** fallback per candidate URL.",
    "",
    "Only rows marked **OK** used successful HTTP responses and parsed WMS Capabilities XML. **CRS/SRS** are taken from `<CRS>` (1.3.0) / `<SRS>` (1.1.1) across the document.",
    "",
    "**MapLibre:** raster basemaps use a Web Mercator tile grid. A WMS is suitable only if capabilities advertise **EPSG:3857** (or legacy **EPSG:900913**). Services that list only **EPSG:25832** / **EPSG:25833** are flagged as not Web-Mercator-compatible for this use case.",
    "",
    "## Summary",
    "",
    markdownSummaryTable(rows),
    "",
    "## WMS URL not found via WFS/config",
    "",
    notFound.length
      ? notFound.map((r) => `- **${r.label}** (\`${r.key}\`): ${r.error ?? "failed"}`).join("\n")
      : "*None - all states with a WFS or configured WMS URL yielded a verifiable attempt record (see failures below if any).*",
    "",
    "## Not verified / failures",
    "",
    notVerified.length
      ? notVerified
          .map((r) => `- **${r.label}** (\`${r.key}\`): ${r.error ?? "not verified"}`)
          .join("\n")
      : "*None.*",
    "",
    "## Details",
    "",
    ...rows.map(detailSection),
  ].join("\n")

  const outPath = join(import.meta.dir, "alkis-wms-audit-results.md")
  writeFileSync(outPath, md, { encoding: "utf8" })
  process.stderr.write(`\nWrote ${outPath}\n`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
