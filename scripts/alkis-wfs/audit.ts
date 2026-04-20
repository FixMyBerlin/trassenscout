#!/usr/bin/env bun
import { alkisStateConfig, type AlkisStateConfigEntry } from "@/src/server/alkis/alkisStateConfig"
import { StateKeyEnum } from "@prisma/client"
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { AUDIT_SCHEMA_VERSION } from "./shared/constants"
import { probeGetFeatureForState, type ProbeResult } from "./shared/probe"
import {
  fetchWfsCapabilities,
  parseCapabilitiesXml,
  sanitizeReportText,
  wfsGetCapabilitiesUrl,
} from "./shared/wfsCapabilities"

/** Parallel GetFeature probes; order of `results` still matches config iteration order. */
const AUDIT_CONCURRENCY = 4

type CapabilitiesResult = {
  ok: boolean
  httpStatus: number
  requestUrl: string
  outputFormats: string[]
  supportsJson: boolean
  featureTypeNames: string[]
  featureTypeExists: boolean
  parcelDefaultCrs: string | null
  verifiedWfsUrl: string | null
  error?: string
}

type StateAuditResult = {
  key: StateKeyEnum
  label: string
  timestamp: string
  configured: {
    wfsUrl: string | null
    parcelPropertyKey: string | null
    alkisParcelIdPropertyKey: string | null
    projection: "EPSG:25832" | "EPSG:25833" | null
    wfsOutputFormat: string | null
    supports4326: boolean
    bboxAxisOrder: "lonlat" | "latlon"
  }
  capabilities: CapabilitiesResult
  probe: ProbeResult
  suggestedConfig: {
    wfsUrl: string | null
    parcelPropertyKey: string | null
    alkisParcelIdPropertyKey: string | null
    projection: "EPSG:25832" | "EPSG:25833" | null
    wfsOutputFormat: string | null
    supports4326: boolean
    bboxAxisOrder: "lonlat" | "latlon"
  }
  verified: boolean
  specialCaseNote: string | null
  todos: string[]
}

type AuditPayload = {
  schemaVersion: number
  generatedAt: string
  results: StateAuditResult[]
}

function extractProjectionFromCrs(
  crs: string | null | undefined,
): "EPSG:25832" | "EPSG:25833" | null {
  if (!crs) return null
  if (crs.includes("25832")) return "EPSG:25832"
  if (crs.includes("25833")) return "EPSG:25833"
  return null
}

function outputFormatLooksJson(fmt: string): boolean {
  const lower = fmt.toLowerCase()
  return lower.includes("json") || lower.includes("geo+json")
}

/** One state: snapshot config → GetCapabilities → optional GetFeature probe → suggested row + todos. */
async function auditOne(
  key: StateKeyEnum,
  entry: AlkisStateConfigEntry,
): Promise<StateAuditResult> {
  // Snapshot of WFS-related fields as used for this run (trimmed URLs/keys).
  const configured =
    entry.wfs.url === false
      ? ({
          wfsUrl: null,
          parcelPropertyKey: null,
          alkisParcelIdPropertyKey: null,
          projection: null,
          wfsOutputFormat: null,
          supports4326: true,
          bboxAxisOrder: "latlon" as const,
        } as const)
      : ({
          wfsUrl: entry.wfs.url.trim() || null,
          parcelPropertyKey: entry.wfs.parcelPropertyKey.trim() || null,
          alkisParcelIdPropertyKey: entry.wfs.alkisParcelIdPropertyKey?.trim() || null,
          projection: entry.wfs.projection,
          wfsOutputFormat: entry.wfs.wfsOutputFormat?.trim() || null,
          supports4326: entry.wfs.supports4326,
          bboxAxisOrder: entry.wfs.bboxAxisOrder,
        } as const)

  const now = new Date().toISOString()
  const specialCaseNote = entry.specialCaseNote?.trim() || null
  const todos: string[] = []

  // No network: cannot audit without base URL and parcel typename.
  if (!configured.wfsUrl || !configured.parcelPropertyKey) {
    return {
      key,
      label: entry.label,
      timestamp: now,
      configured,
      capabilities: {
        ok: false,
        httpStatus: 0,
        requestUrl: configured.wfsUrl ? wfsGetCapabilitiesUrl(configured.wfsUrl) : "",
        outputFormats: [],
        supportsJson: false,
        featureTypeNames: [],
        featureTypeExists: false,
        parcelDefaultCrs: null,
        verifiedWfsUrl: null,
        error: "Missing configured wfsUrl or parcelPropertyKey.",
      },
      probe: {
        ok: false,
        httpStatus: 0,
        supports4326: false,
        chosenOutputFormat: null,
        bboxAxisOrder: null,
        projection: configured.projection,
        featureCount: 0,
        detectedParcelIdPropertyKey: null,
        firstFeaturePropertyKeys: [],
        notes: [],
        error: "Skipped because required config fields are missing.",
      },
      suggestedConfig: {
        ...configured,
      },
      verified: false,
      specialCaseNote,
      todos: ["Verify public WFS endpoint and typename manually."],
    }
  }

  // GetCapabilities: verify HTTP + parse; check configured typename exists.
  const fetched = await fetchWfsCapabilities(configured.wfsUrl)
  const parsed = fetched.ok ? parseCapabilitiesXml(fetched.xml) : undefined
  const featureTypes = parsed?.featureTypes ?? []
  const outputFormats = [...new Set(parsed?.outputFormats ?? [])]
  const match = featureTypes.find((ft) => ft.name === configured.parcelPropertyKey)
  const capabilities: CapabilitiesResult = {
    ok: fetched.ok && !parsed?.error,
    httpStatus: fetched.httpStatus,
    requestUrl: fetched.requestUrl,
    outputFormats,
    supportsJson: outputFormats.some(outputFormatLooksJson),
    featureTypeNames: featureTypes.map((ft) => ft.name),
    featureTypeExists: Boolean(match),
    parcelDefaultCrs: match?.defaultCrs || null,
    verifiedWfsUrl: fetched.ok ? configured.wfsUrl : null,
    error: fetched.error ?? parsed?.error,
  }

  if (!capabilities.ok) {
    todos.push("Capabilities request failed; keep previous config values.")
  }
  if (capabilities.ok && !capabilities.featureTypeExists) {
    todos.push("Configured parcel typename not found in capabilities.")
  }

  const projectionFromCapabilities = extractProjectionFromCrs(capabilities.parcelDefaultCrs)
  const projection = configured.projection ?? projectionFromCapabilities
  // BBOX GetFeature at test coordinate; skipped here if capabilities failed (see probe.ts for 4326=false).
  const probe = capabilities.ok
    ? await probeGetFeatureForState({
        stateKey: key,
        label: entry.label,
        wfsUrl: configured.wfsUrl,
        typename: configured.parcelPropertyKey,
        configuredAlkisParcelIdPropertyKey: configured.alkisParcelIdPropertyKey,
        configuredWfsOutputFormat: configured.wfsOutputFormat,
        configuredBboxAxisOrder: configured.bboxAxisOrder,
        configuredSupports4326: configured.supports4326,
        projection,
        capabilities: {
          outputFormats: capabilities.outputFormats,
        },
      })
    : {
        ok: false,
        httpStatus: capabilities.httpStatus,
        supports4326: configured.supports4326,
        chosenOutputFormat: null,
        bboxAxisOrder: null,
        projection,
        featureCount: 0,
        detectedParcelIdPropertyKey: null,
        firstFeaturePropertyKeys: [],
        notes: [],
        error: "Probe skipped because capabilities did not verify.",
      }

  if (!probe.ok) {
    todos.push("GetFeature probe did not return usable features at test coordinate.")
  }
  if (!configured.supports4326) {
    todos.push(
      "Route currently returns 501 for supports4326=false; 4326 reprojection not implemented yet.",
    )
  }
  if (probe.ok && !probe.detectedParcelIdPropertyKey) {
    todos.push("Could not infer parcel id key from probe feature properties.")
  }

  // Merge probe hints into a row update-config may apply when verified === true.
  const suggestedConfig: StateAuditResult["suggestedConfig"] = {
    wfsUrl: capabilities.verifiedWfsUrl ?? configured.wfsUrl,
    parcelPropertyKey: configured.parcelPropertyKey,
    alkisParcelIdPropertyKey:
      probe.detectedParcelIdPropertyKey ?? configured.alkisParcelIdPropertyKey ?? null,
    projection: probe.projection ?? projection ?? configured.projection,
    wfsOutputFormat: probe.chosenOutputFormat ?? configured.wfsOutputFormat,
    supports4326: probe.ok ? probe.supports4326 : configured.supports4326,
    bboxAxisOrder: probe.bboxAxisOrder ?? configured.bboxAxisOrder,
  }

  // Both steps must succeed for automated config refresh.
  const verified = Boolean(capabilities.ok && probe.ok)
  return {
    key,
    label: entry.label,
    timestamp: now,
    configured,
    capabilities,
    probe,
    suggestedConfig,
    verified,
    specialCaseNote,
    todos,
  }
}

/** Summary table in audit-results.md */
function markdownTable(results: StateAuditResult[]): string {
  const header =
    "| Bundesland | Capabilities | Probe | Suggested parcel id key | Suggested axis order | Suggested supports4326 | TODOs |"
  const sep = "|---|:---:|:---:|---|---|:---:|---|"
  const lines = results.map((r) => {
    return `| ${r.label} | ${r.capabilities.ok ? "ok" : "fail"} | ${r.probe.ok ? "ok" : "fail"} | ${r.suggestedConfig.alkisParcelIdPropertyKey ?? "—"} | ${r.suggestedConfig.bboxAxisOrder} | ${r.suggestedConfig.supports4326 ? "yes" : "no"} | ${r.todos.length ? r.todos.length : 0} |`
  })
  return [header, sep, ...lines].join("\n")
}

/** Per-state section in audit-results.md */
function detailBlock(r: StateAuditResult): string {
  const lines: string[] = []
  lines.push(`### ${r.label} (\`${r.key}\`)`)
  lines.push("")
  lines.push(`- Verified: ${r.verified ? "yes" : "no"}`)
  lines.push(`- Capabilities URL: \`${r.capabilities.requestUrl}\``)
  lines.push(
    `- Capabilities status: ${r.capabilities.httpStatus || "—"} (${r.capabilities.ok ? "ok" : "fail"})`,
  )
  if (r.capabilities.error)
    lines.push(`- Capabilities error: ${sanitizeReportText(r.capabilities.error)}`)
  lines.push(`- Probe status: ${r.probe.httpStatus || "—"} (${r.probe.ok ? "ok" : "fail"})`)
  if (r.probe.error) lines.push(`- Probe error: ${sanitizeReportText(r.probe.error)}`)
  if (r.probe.notes.length) lines.push(`- Probe notes: ${r.probe.notes.join(" | ")}`)
  lines.push(`- Suggested config: \`${JSON.stringify(r.suggestedConfig)}\``)
  if (r.specialCaseNote) lines.push(`- Special case: ${r.specialCaseNote}`)
  if (r.todos.length) {
    lines.push("- TODOs:")
    for (const t of r.todos) lines.push(`  - ${t}`)
  }
  lines.push("")
  return lines.join("\n")
}

/** All states except DISABLED; write JSON (machine) + MD (human). */
async function main() {
  const entries = Object.entries(alkisStateConfig).filter(
    ([key]) => key !== StateKeyEnum.DISABLED,
  ) as [StateKeyEnum, AlkisStateConfigEntry][]

  const results: StateAuditResult[] = new Array(entries.length)
  for (let i = 0; i < entries.length; i += AUDIT_CONCURRENCY) {
    // Chunked Promise.all keeps wall-clock down while preserving results[i] order.
    const chunk = entries.slice(i, i + AUDIT_CONCURRENCY)
    await Promise.all(
      chunk.map(async ([key, entry], j) => {
        process.stderr.write(`ALKIS audit ${key}...\n`)
        results[i + j] = await auditOne(key, entry)
      }),
    )
  }

  const payload: AuditPayload = {
    schemaVersion: AUDIT_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    results,
  }

  const outDir = join(import.meta.dir, "results")
  mkdirSync(outDir, { recursive: true })
  const jsonPath = join(outDir, "audit-results.json")
  writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8")

  const md = [
    "# ALKIS WFS audit",
    "",
    `Generated: ${payload.generatedAt}`,
    "",
    "This report combines `GetCapabilities` verification with a small `GetFeature` probe.",
    "",
    "## Summary",
    "",
    markdownTable(results),
    "",
    "## Details",
    "",
    ...results.map(detailBlock),
  ].join("\n")
  const mdPath = join(outDir, "audit-results.md")
  writeFileSync(mdPath, `${md}\n`, "utf8")

  process.stderr.write(`\nWrote ${jsonPath}\nWrote ${mdPath}\n`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
