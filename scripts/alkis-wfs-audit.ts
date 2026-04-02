#!/usr/bin/env bun
/**
 * Fetches WFS 2.0.0 GetCapabilities for each ALKIS endpoint (configured `wfsUrl` and/or
 * WMS-derived candidate URLs), extracts JSON support, CRS info, and feature types,
 * and writes a markdown report with **verified facts only** (successful HTTP + parsed XML).
 *
 * Run: bun scripts/alkis-wfs-audit.ts
 */

import { StateKeyEnum } from "@prisma/client"
import { writeFileSync } from "node:fs"
import { join } from "node:path"
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

type Attempt = { url: string; httpStatus: number; error?: string }

type AuditRow = {
  key: StateKeyEnum
  label: string
  configuredWfsUrl?: string
  wmsUrlForDerivation?: string
  attempts: Attempt[]
  /** Only set when GetCapabilities succeeded and XML parsed for this exact URL. */
  verifiedWfsUrl?: string
  verifiedSource?: "configured" | "derived"
  wfsUrl: string
  httpStatus: number
  ok: boolean
  error?: string
  outputFormats: string[]
  supportsJson: boolean
  featureTypeNames: string[]
  parcelPropertyKey?: string
  featureTypeExists: boolean
  defaultCrsForParcel?: string
  allCrsHints: string[]
  /** True only when CRS for 4326/3857 columns is taken from the parcel feature type (or global if no parcel key). */
  crsVerified: boolean
  crsUnverifiedReason?: string
  supports4326: boolean
  supports3857: boolean
  webMercatorOnly900913: boolean
  crsNotation: "urn" | "short" | "mixed"
}

/** Bun scripts do not expose DOMParser; use regex extraction for predictable WFS Capabilities XML. */
function parseCapabilitiesXml(xml: string): {
  outputFormats: string[]
  featureTypes: { name: string; defaultCrs: string; otherCrs: string[] }[]
  error?: string
} {
  const trimmed = xml.trim()
  if (!trimmed.startsWith("<")) {
    return { outputFormats: [], featureTypes: [], error: "Response is not XML" }
  }

  const outputFormats: string[] = []
  const opRe =
    /<(?:[\w.]+:)?Operation\b[^>]*\bname=["']GetFeature["'][^>]*>([\s\S]*?)<\/(?:[\w.]+:)?Operation>/i
  const opM = trimmed.match(opRe)
  const opInner = opM?.[1]
  if (opInner) {
    const paramRe =
      /<(?:[\w.]+:)?Parameter\b[^>]*\bname=["']outputFormat["'][^>]*>([\s\S]*?)<\/(?:[\w.]+:)?Parameter>/i
    const pm = opInner.match(paramRe)
    const paramBlock = pm?.[1] ?? opInner
    const valueRe = /<(?:[\w.]+:)?Value\b[^>]*>([^<]*)<\/(?:[\w.]+:)?Value>/gi
    let vm: RegExpExecArray | null
    while ((vm = valueRe.exec(paramBlock)) !== null) {
      const t = vm[1]?.trim()
      if (t) outputFormats.push(t)
    }
  }

  const featureTypes: { name: string; defaultCrs: string; otherCrs: string[] }[] = []
  const ftRe = /<(?:[\w.]+:)?FeatureType\b[^>]*>([\s\S]*?)<\/(?:[\w.]+:)?FeatureType>/gi
  let ftm: RegExpExecArray | null
  while ((ftm = ftRe.exec(trimmed)) !== null) {
    const block = ftm[1] ?? ""
    const nameM = block.match(/<(?:[\w.]+:)?Name\b[^>]*>([^<]*)<\/(?:[\w.]+:)?Name>/i)
    const name = nameM?.[1]?.trim() ?? ""
    if (!name) continue
    const defM = block.match(/<(?:[\w.]+:)?DefaultCRS\b[^>]*>([^<]*)<\/(?:[\w.]+:)?DefaultCRS>/i)
    const defaultCrs = defM?.[1]?.trim() ?? ""
    const otherCrs: string[] = []
    const ocr = /<(?:[\w.]+:)?OtherCRS\b[^>]*>([^<]*)<\/(?:[\w.]+:)?OtherCRS>/gi
    let om: RegExpExecArray | null
    while ((om = ocr.exec(block)) !== null) {
      const t = om[1]?.trim()
      if (t) otherCrs.push(t)
    }
    featureTypes.push({ name, defaultCrs, otherCrs })
  }

  if (!outputFormats.length && !featureTypes.length) {
    return {
      outputFormats: [],
      featureTypes: [],
      error: "Could not parse FeatureTypeList or GetFeature output formats (unexpected XML shape?)",
    }
  }

  return { outputFormats, featureTypes }
}

const JSON_HINTS = ["application/json", "application/geo+json", "geojson", "json"] as const

function outputFormatLooksJson(fmt: string): boolean {
  const lower = fmt.toLowerCase()
  return JSON_HINTS.some((h) => lower.includes(h))
}

function crsList4326Hints(crsStrings: string[]): {
  supports4326: boolean
  notation: "urn" | "short" | "mixed"
} {
  let hasUrn = false
  let hasShort = false
  for (const s of crsStrings) {
    if (!s) continue
    if (s.includes("EPSG::4326") || s.includes("crs:EPSG::4326")) hasUrn = true
    if (/EPSG:4326\b/i.test(s) && !s.includes("EPSG::4326")) hasShort = true
    if (s === "EPSG:4326" || (s.endsWith(":4326") && /^urn:/i.test(s))) {
      if (s.includes("::4326")) hasUrn = true
      else hasShort = true
    }
  }
  const supports4326 = hasUrn || hasShort
  let notation: "urn" | "short" | "mixed" = "short"
  if (hasUrn && hasShort) notation = "mixed"
  else if (hasUrn) notation = "urn"
  else if (hasShort) notation = "short"
  return { supports4326, notation }
}

/** Web Mercator: EPSG:3857 or legacy EPSG:900913 (same projection MapLibre uses as `EPSG:3857`). */
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
      /def\/crs\/EPSG\/0\/3857/i.test(s)
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

function collectCrsFromFeatureType(ft: { defaultCrs: string; otherCrs: string[] }): string[] {
  return [ft.defaultCrs, ...ft.otherCrs].filter(Boolean)
}

/** Inverse heuristics of `deriveWmsCandidatesFromWfs` in `alkis-wms-audit.ts` (attempts only). */
function deriveWfsCandidatesFromWms(wmsUrl: string): string[] {
  const base = wmsUrl.trim()
  const out: string[] = []
  const push = (s: string) => {
    const t = s.trim()
    if (!t || t === base) return
    if (!out.includes(t)) out.push(t)
  }

  const chain = base
    .replace(/www\.wms\./gi, "www.wfs.")
    .replace(/\/registry\/wms\//gi, "/registry/wfs/")
    .replace(/\/wms\//gi, "/wfs/")
    .replace(/\/wms_nw_/gi, "/wfs_nw/")
    .replace(/wms_nw_alkis/gi, "wfs_nw_alkis_vereinfacht")
    .replace(/_wms_/gi, "_wfs_")
    .replace(/\/wms$/gi, "/wfs")
    .replace(/_wms$/gi, "_wfs")
    .replace(/WMS_/g, "WFS_")
    .replace(/wms/gi, "wfs2")
  push(chain)

  push(base.replace(/www\.wms\./gi, "www.wfs."))
  push(base.replace(/\/registry\/wms\//gi, "/registry/wfs/"))
  push(base.replace(/\/wms\//gi, "/wfs/"))
  push(base.replace(/\/wms_nw_/gi, "/wfs_nw/"))
  push(base.replace(/wms_nw_alkis/gi, "wfs_nw_alkis_vereinfacht"))
  push(base.replace(/_wms_/gi, "_wfs_"))
  push(base.replace(/WMS_/g, "WFS_"))
  push(base.replace(/wms/gi, "wfs2"))
  push(base.replace(/\/wms$/gi, "/wfs"))
  push(base.replace(/_wms$/gi, "_wfs"))

  const reg = base.match(/^(https?:\/\/[^?]+?)\/registry\/wms\/(\d+)/i)
  if (reg) {
    push(`${reg[1]}/registry/wfs/${reg[2]}`)
  }

  return out
}

function wfsGetCapabilitiesUrl(baseUrl: string): string {
  const u = new URL(baseUrl)
  u.searchParams.set("SERVICE", "WFS")
  u.searchParams.set("VERSION", "2.0.0")
  u.searchParams.set("REQUEST", "GetCapabilities")
  return u.toString()
}

async function fetchWfsCapabilities(baseUrl: string): Promise<{
  ok: boolean
  httpStatus: number
  xml: string
  error?: string
}> {
  const url = wfsGetCapabilitiesUrl(baseUrl)
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/xml, text/xml, */*" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    const httpStatus = res.status
    const xml = await res.text()
    if (!res.ok) {
      return {
        ok: false,
        httpStatus,
        xml: "",
        error: `HTTP ${httpStatus}: ${sanitizeReportText(xml, 220)}`,
      }
    }
    return { ok: true, httpStatus, xml }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, httpStatus: 0, xml: "", error: msg }
  }
}

function buildWfsCandidates(entry: AlkisBackgroundConfigEntry): {
  url: string
  source: "configured" | "derived"
}[] {
  const configured = entry.wfsUrl?.trim()
  const wms = entry.wmsUrl?.trim()
  const candidates: { url: string; source: "configured" | "derived" }[] = []
  if (configured) {
    candidates.push({ url: configured, source: "configured" })
  }
  if (wms) {
    for (const u of deriveWfsCandidatesFromWms(wms)) {
      if (!candidates.some((c) => c.url === u)) {
        candidates.push({ url: u, source: "derived" })
      }
    }
  }
  return candidates
}

async function auditOne(key: StateKeyEnum, entry: AlkisBackgroundConfigEntry): Promise<AuditRow> {
  const parcelPropertyKey = entry.parcelPropertyKey?.trim()
  const configuredWfs = entry.wfsUrl?.trim()
  const wmsForDerivation = entry.wmsUrl?.trim()

  const base: Omit<
    AuditRow,
    | "attempts"
    | "verifiedWfsUrl"
    | "verifiedSource"
    | "wfsUrl"
    | "httpStatus"
    | "ok"
    | "outputFormats"
    | "supportsJson"
    | "featureTypeNames"
    | "featureTypeExists"
    | "defaultCrsForParcel"
    | "allCrsHints"
    | "crsVerified"
    | "crsUnverifiedReason"
    | "supports4326"
    | "supports3857"
    | "webMercatorOnly900913"
    | "crsNotation"
    | "error"
  > = {
    key,
    label: entry.label,
    configuredWfsUrl: configuredWfs || undefined,
    wmsUrlForDerivation: wmsForDerivation || undefined,
    parcelPropertyKey,
  }

  const attempts: Attempt[] = []
  const candidates = buildWfsCandidates(entry)

  const emptyFailure = (
    err: string,
  ): AuditRow => ({
    ...base,
    attempts,
    wfsUrl: configuredWfs ?? "",
    httpStatus: 0,
    ok: false,
    error: err,
    outputFormats: [],
    supportsJson: false,
    featureTypeNames: [],
    featureTypeExists: false,
    allCrsHints: [],
    crsVerified: false,
    crsUnverifiedReason: err,
    supports4326: false,
    supports3857: false,
    webMercatorOnly900913: false,
    crsNotation: "short",
  })

  if (!candidates.length) {
    return emptyFailure(
      configuredWfs
        ? "internal: no candidates (unexpected)"
        : wmsForDerivation
          ? "no WFS candidate URL produced from wmsUrl derivation rules"
          : "no wfsUrl and no wmsUrl to derive from",
    )
  }

  for (const { url, source } of candidates) {
    const res = await fetchWfsCapabilities(url)
    const capsUrl = wfsGetCapabilitiesUrl(url)
    if (!res.ok) {
      attempts.push({
        url: capsUrl,
        httpStatus: res.httpStatus,
        error: res.error,
      })
      continue
    }

    const parsed = parseCapabilitiesXml(res.xml)
    if (parsed.error) {
      attempts.push({
        url: capsUrl,
        httpStatus: res.httpStatus,
        error: parsed.error,
      })
      continue
    }

    attempts.push({ url: capsUrl, httpStatus: res.httpStatus })

    const outputFormats = [...new Set(parsed.outputFormats)]
    const supportsJson = outputFormats.some(outputFormatLooksJson)
    const featureTypeNames = parsed.featureTypes.map((ft) => ft.name)
    const matchFt = parcelPropertyKey
      ? parsed.featureTypes.find((ft) => ft.name === parcelPropertyKey)
      : undefined
    const featureTypeExists = Boolean(parcelPropertyKey && matchFt)
    const allCrsHints = matchFt ? collectCrsFromFeatureType(matchFt) : []
    const globalCrs = parsed.featureTypes.flatMap(collectCrsFromFeatureType)

    let crsForDetection: string[] = []
    let crsVerified = false
    let crsUnverifiedReason: string | undefined

    if (parcelPropertyKey) {
      if (!matchFt) {
        crsUnverifiedReason =
          "configured parcel typename not found in FeatureType list — CRS columns not verified"
        crsForDetection = []
      } else if (!collectCrsFromFeatureType(matchFt).length) {
        crsUnverifiedReason =
          "parcel feature type has no DefaultCRS/OtherCRS in capabilities — CRS columns not verified"
        crsForDetection = []
      } else {
        crsForDetection = collectCrsFromFeatureType(matchFt)
        crsVerified = true
      }
    } else {
      crsForDetection = globalCrs
      crsVerified = globalCrs.length > 0
      if (!crsVerified) {
        crsUnverifiedReason = "no CRS elements parsed from any feature type"
      }
    }

    const { supports4326, notation } = crsList4326Hints(crsForDetection)
    const { supports3857, only900913 } = crsList3857Hints(crsForDetection)

    return {
      ...base,
      attempts,
      verifiedWfsUrl: url,
      verifiedSource: source,
      wfsUrl: url,
      httpStatus: res.httpStatus,
      ok: true,
      outputFormats,
      supportsJson,
      featureTypeNames,
      featureTypeExists,
      defaultCrsForParcel: matchFt?.defaultCrs,
      allCrsHints,
      crsVerified,
      crsUnverifiedReason: crsVerified ? undefined : crsUnverifiedReason,
      supports4326: crsVerified ? supports4326 : false,
      supports3857: crsVerified ? supports3857 : false,
      webMercatorOnly900913: crsVerified ? only900913 : false,
      crsNotation: crsVerified ? notation : "short",
    }
  }

  const last = attempts[attempts.length - 1]
  return {
    ...base,
    attempts,
    wfsUrl: configuredWfs ?? candidates[0]!.url,
    httpStatus: last?.httpStatus ?? 0,
    ok: false,
    error: last?.error ?? "WFS GetCapabilities not verified from configured or derived candidates",
    outputFormats: [],
    supportsJson: false,
    featureTypeNames: [],
    featureTypeExists: false,
    allCrsHints: [],
    crsVerified: false,
    crsUnverifiedReason: last?.error,
    supports4326: false,
    supports3857: false,
    webMercatorOnly900913: false,
    crsNotation: "short",
  }
}

function format3857Cell(r: AuditRow): string {
  if (!r.ok) return "—"
  if (!r.crsVerified) return "—"
  if (!r.supports3857) return "no"
  if (r.webMercatorOnly900913) return "yes (900913)"
  return "yes"
}

function format4326Cell(r: AuditRow): string {
  if (!r.ok) return "—"
  if (!r.crsVerified) return "—"
  return r.supports4326 ? "yes" : "no"
}

function formatJsonCell(r: AuditRow): string {
  if (!r.ok) return "—"
  return r.supportsJson ? "yes" : "no"
}

function markdownTable(rows: AuditRow[]): string {
  const header =
    "| Bundesland | WFS base URL (verified) | HTTP | OK | JSON | 4326 | 3857 | CRS note | Typename match | Parcel DefaultCRS |"
  const sep = "|---|---|---:|:---:|:-:|:-:|:-:|:-:|:-:|---|"
  const lines = rows.map((r) => {
    const src =
      r.verifiedWfsUrl && r.verifiedSource
        ? ` (${r.verifiedSource})`
        : ""
    const urlCell = r.verifiedWfsUrl
      ? `\`${r.verifiedWfsUrl.slice(0, 56)}${r.verifiedWfsUrl.length > 56 ? "…" : ""}\`${src}`
      : "—"
    const json = formatJsonCell(r)
    const c4326 = format4326Cell(r)
    const c3857 = format3857Cell(r)
    const crsNote = !r.ok ? "—" : r.crsVerified ? r.crsNotation : "not verified"
    const match = r.parcelPropertyKey
      ? r.ok
        ? r.featureTypeExists
          ? "yes"
          : "no"
        : "—"
      : "—"
    return `| ${r.label} | ${urlCell} | ${r.httpStatus || "—"} | ${r.ok ? "yes" : "no"} | ${json} | ${c4326} | ${c3857} | ${crsNote} | ${match} | ${r.ok && r.defaultCrsForParcel ? r.defaultCrsForParcel : "—"} |`
  })
  const footnote =
    "\n\n**Verified** WFS URL appears only after a successful GetCapabilities (HTTP 2xx) and parse. **CRS columns** require a parsed CRS list for the parcel feature type (or global feature types if no parcel typename is configured). `yes (900913)` means only EPSG:900913 appears for Web Mercator — equivalent to EPSG:3857 for map bbox / MapLibre."
  return [header, sep, ...lines].join("\n") + footnote
}

function detailSection(r: AuditRow): string {
  const parts = [`### ${r.label} (\`${r.key}\`)`, ""]
  parts.push(`- **Configured wfsUrl (before audit):** ${r.configuredWfsUrl ?? "—"}`)
  parts.push(`- **wmsUrl used for derivation (if any):** ${r.wmsUrlForDerivation ?? "—"}`)
  parts.push("- **GetCapabilities attempts:**")
  for (const a of r.attempts) {
    const tail = a.error ?? `HTTP ${a.httpStatus || "—"}`
    parts.push(
      `  - \`${a.url.slice(0, 120)}${a.url.length > 120 ? "…" : ""}\` → ${tail}`,
    )
  }
  parts.push(`- **Verified WFS base URL:** ${r.verifiedWfsUrl ?? "—"}`)
  if (r.verifiedWfsUrl) {
    parts.push(`- **Verification source:** ${r.verifiedSource ?? "—"}`)
  }
  if (r.error && !r.ok) parts.push(`- **Outcome:** ${sanitizeReportText(r.error, 320)}`)
  parts.push(`- **HTTP (last successful attempt):** ${r.ok ? r.httpStatus : r.httpStatus || "—"}`)

  if (!r.ok) {
    parts.push("- **Parsed capabilities:** — (not verified)")
    parts.push("")
    return parts.join("\n")
  }

  parts.push(`- **GetFeature JSON-ish output formats:** ${r.supportsJson ? "yes" : "no"}`)
  if (r.outputFormats.length) {
    parts.push(
      `- **Output formats (sample):** ${r.outputFormats.slice(0, 12).join(", ")}${r.outputFormats.length > 12 ? ", …" : ""}`,
    )
  }
  parts.push(`- **Configured parcel typename:** ${r.parcelPropertyKey ?? "—"}`)
  parts.push(`- **Typename in capabilities:** ${r.parcelPropertyKey ? (r.featureTypeExists ? "yes" : "no") : "—"}`)
  if (r.featureTypeNames.length) {
    parts.push(
      `- **Feature types (first 20):** ${r.featureTypeNames.slice(0, 20).join(", ")}${r.featureTypeNames.length > 20 ? ", …" : ""}`,
    )
  }
  parts.push(
    `- **CRS for parcel type (hints):** ${r.allCrsHints.length ? r.allCrsHints.join(", ") : "—"}`,
  )
  if (r.crsUnverifiedReason) {
    parts.push(`- **CRS verification:** ${r.crsUnverifiedReason}`)
  }
  parts.push(
    `- **EPSG:4326 (verified for CRS scope above):** ${r.crsVerified ? (r.supports4326 ? "yes" : "no") : "—"}`,
  )
  parts.push(
    `- **EPSG:3857 / Web Mercator (verified for CRS scope above):** ${r.crsVerified ? (r.supports3857 ? (r.webMercatorOnly900913 ? "yes (capabilities list EPSG:900913 only; equivalent to 3857)" : "yes") : "no") : "—"}`,
  )
  parts.push(`- **CRS notation:** ${r.crsVerified ? r.crsNotation : "—"}`)
  parts.push("")
  return parts.join("\n")
}

async function main() {
  const entries = Object.entries(alkisStateConfig).filter(
    ([k, v]) =>
      k !== StateKeyEnum.DISABLED && (v.wfsUrl?.trim() || v.wmsUrl?.trim()),
  ) as [StateKeyEnum, AlkisBackgroundConfigEntry][]

  const rows: AuditRow[] = []
  for (const [key, entry] of entries) {
    process.stderr.write(`WFS audit ${key}…\n`)
    rows.push(await auditOne(key, entry))
  }

  const notVerified = rows.filter((r) => !r.ok)
  const verifiedNoJson = rows.filter((r) => r.ok && !r.supportsJson)

  const generatedAt = new Date().toISOString()
  const md = [
    "# ALKIS WFS GetCapabilities audit",
    "",
    `Generated: ${generatedAt}`,
    "",
    "Request: `SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities`",
    "",
    "This file lists **only verified facts** from successful HTTP responses (2xx) and successfully parsed GetCapabilities XML. Rows with **OK = no** document failed attempts (URL + reason). **Derived** URLs are heuristic attempts from `wmsUrl` and are **not** treated as the official WFS endpoint unless verification succeeded for that exact URL (this script does not write `alkisStateConfig.ts`).",
    "",
    "## Summary",
    "",
    "Columns **4326** and **3857** are filled only when CRS could be verified from the configured parcel feature type’s DefaultCRS/OtherCRS (or from all feature types when no parcel typename is configured).",
    "",
    markdownTable(rows),
    "",
    "## States without JSON / GeoJSON-style GetFeature formats (verified in this run)",
    "",
    verifiedNoJson.length
      ? verifiedNoJson.map((r) => `- **${r.label}** (\`${r.key}\`)`).join("\n")
      : "*None in this run.*",
    "",
    "## Not verified / failures",
    "",
    notVerified.length
      ? notVerified
          .map((r) => {
            const lastAttempt = r.attempts[r.attempts.length - 1]
            const tried = lastAttempt?.url ?? "(no request URL recorded)"
            const raw = r.error ?? lastAttempt?.error ?? "unknown"
            const reason = sanitizeReportText(raw, 280)
            return `- **${r.label}** (\`${r.key}\`): last attempt \`${tried}\` — ${reason}`
          })
          .join("\n")
      : "*None.*",
    "",
    "## Details",
    "",
    ...rows.map(detailSection),
  ].join("\n")

  const outPath = join(import.meta.dir, "alkis-wfs-audit-results.md")
  writeFileSync(outPath, md, "utf8")
  process.stderr.write(`\nWrote ${outPath}\n`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
