#!/usr/bin/env bun
import {
  alkisStateConfig,
  type AlkisStateConfigEntry,
  type AlkisWfsConfig,
  type AlkisWmsConfig,
} from "@/src/app/api/(auth)/[projectSlug]/alkis-wfs-parcels/_utils/alkisStateConfig"
import { StateKeyEnum } from "@prisma/client"
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { AUDIT_SCHEMA_VERSION } from "./shared/constants"

type SuggestedConfig = {
  wfsUrl: string | null
  parcelPropertyKey: string | null
  alkisParcelIdPropertyKey: string | null
  projection: "EPSG:25832" | "EPSG:25833" | null
  wfsOutputFormat: string | null
  supports4326: boolean
  bboxAxisOrder: "lonlat" | "latlon"
}

type AuditStateResult = {
  key: StateKeyEnum
  verified: boolean
  suggestedConfig: SuggestedConfig
  todos: string[]
}

type AuditPayload = {
  schemaVersion: number
  generatedAt: string
  results: AuditStateResult[]
}

function toLiteral(value: string | null): string {
  return value === null ? "null" : JSON.stringify(value)
}

function wfsSupportsJsonFromOutputFormat(fmt: string | null): boolean {
  return (fmt ?? "").toLowerCase().includes("json")
}

function mergeWfs(base: AlkisStateConfigEntry, useSuggested: boolean, suggested?: SuggestedConfig) {
  if (base.wfs.url === false) {
    return { url: false }
  }

  const b = base.wfs
  const nextUrl = useSuggested ? (suggested?.wfsUrl ?? b.url) : b.url
  const nextTypename = useSuggested
    ? (suggested?.parcelPropertyKey ?? b.parcelPropertyKey)
    : b.parcelPropertyKey
  const trimmedUrl = typeof nextUrl === "string" ? nextUrl.trim() : ""
  const trimmedTypename = typeof nextTypename === "string" ? nextTypename.trim() : ""
  if (!trimmedUrl || !trimmedTypename) {
    return { url: false }
  }

  const alkisParcelIdPropertyKey = useSuggested
    ? (suggested?.alkisParcelIdPropertyKey ?? b.alkisParcelIdPropertyKey)
    : b.alkisParcelIdPropertyKey
  const projectionRaw = useSuggested ? (suggested?.projection ?? b.projection) : b.projection
  const projection =
    projectionRaw === "EPSG:25832" || projectionRaw === "EPSG:25833" ? projectionRaw : b.projection

  const wfsOutputFormat = useSuggested
    ? (suggested?.wfsOutputFormat ?? b.wfsOutputFormat)
    : b.wfsOutputFormat
  const supports4326 = useSuggested ? (suggested?.supports4326 ?? b.supports4326) : b.supports4326
  const bboxAxisOrder = useSuggested
    ? (suggested?.bboxAxisOrder ?? b.bboxAxisOrder)
    : b.bboxAxisOrder

  const effectiveOutput = useSuggested
    ? (suggested?.wfsOutputFormat ?? b.wfsOutputFormat)
    : b.wfsOutputFormat

  return {
    url: trimmedUrl,
    parcelPropertyKey: trimmedTypename,
    alkisParcelIdPropertyKey,
    projection,
    wfsOutputFormat,
    supports4326,
    bboxAxisOrder,
    wfsSupportsJson: wfsSupportsJsonFromOutputFormat(effectiveOutput ?? null),
  }
}

function buildNextEntry(base: AlkisStateConfigEntry, audit: AuditStateResult | undefined) {
  const isAuditVerified = audit?.verified === true
  const useSuggested = isAuditVerified
  const suggested = audit?.suggestedConfig

  return {
    label: base.label,
    enabled: base.enabled,
    attribution: base.attribution,
    specialCaseNote: base.specialCaseNote,
    wms: base.wms,
    wfs: mergeWfs(base, useSuggested, suggested),
  }
}

function renderWms(wms: AlkisWmsConfig): string[] {
  if (wms.url === false) {
    return ["    wms: { url: false },"]
  }
  return [
    "    wms: {",
    `      url: ${JSON.stringify(wms.url)},`,
    `      layerName: ${JSON.stringify(wms.layerName)},`,
    "    },",
  ]
}

function renderWfs(wfs: AlkisWfsConfig): string[] {
  if (wfs.url === false) {
    return ["    wfs: { url: false },"]
  }
  return [
    "    wfs: {",
    `      url: ${JSON.stringify(wfs.url)},`,
    `      parcelPropertyKey: ${JSON.stringify(wfs.parcelPropertyKey)},`,
    `      alkisParcelIdPropertyKey: ${toLiteral(wfs.alkisParcelIdPropertyKey)},`,
    `      projection: ${JSON.stringify(wfs.projection)},`,
    `      wfsOutputFormat: ${toLiteral(wfs.wfsOutputFormat)},`,
    `      supports4326: ${wfs.supports4326},`,
    `      bboxAxisOrder: ${JSON.stringify(wfs.bboxAxisOrder)},`,
    `      wfsSupportsJson: ${wfs.wfsSupportsJson},`,
    "    },",
  ]
}

function renderEntry(
  key: StateKeyEnum,
  base: AlkisStateConfigEntry,
  audit: AuditStateResult | undefined,
): string {
  const isAuditVerified = audit?.verified === true
  const next = buildNextEntry(base, audit)

  const lines: string[] = []
  if (!isAuditVerified && key !== StateKeyEnum.DISABLED) {
    const reason = audit
      ? audit.todos.join(" | ") || "state not verified in audit"
      : "missing audit row"
    lines.push(`  // TODO: unverified in latest audit (${reason})`)
  }

  lines.push(`  ${key}: {`)
  lines.push(`    label: ${JSON.stringify(next.label)},`)
  lines.push(`    enabled: ${next.enabled},`)
  lines.push(`    attribution: ${toLiteral(next.attribution)},`)
  lines.push(`    specialCaseNote: ${toLiteral(next.specialCaseNote)},`)
  lines.push(...renderWms(next.wms))
  // @ts-expect-error
  lines.push(...renderWfs(next.wfs))
  lines.push("  },")
  return lines.join("\n")
}

function main() {
  const auditPath = join(import.meta.dir, "results", "audit-results.json")
  const raw = readFileSync(auditPath, "utf8")
  const payload = JSON.parse(raw) as AuditPayload
  if (payload.schemaVersion !== AUDIT_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported audit schemaVersion ${payload.schemaVersion}. Expected ${AUDIT_SCHEMA_VERSION}.`,
    )
  }

  const byKey = new Map(payload.results.map((r) => [r.key, r]))
  const keys = Object.keys(alkisStateConfig) as StateKeyEnum[]
  const renderedEntries = keys
    .map((key) => renderEntry(key, alkisStateConfig[key], byKey.get(key)))
    .join("\n")

  const out = `import { StateKeyEnum } from "@prisma/client"

/** WMS background: absent (\`url: false\`) or URL + layer name together. */
export type AlkisWmsConfig =
  | { url: false }
  | { url: string; layerName: string }

export type AlkisWfsDisabled = { url: false }

export type AlkisWfsEnabled = {
  url: string
  parcelPropertyKey: string
  alkisParcelIdPropertyKey: string | null
  projection: "EPSG:25832" | "EPSG:25833"
  wfsOutputFormat: string | null
  supports4326: boolean
  bboxAxisOrder: "lonlat" | "latlon"
  /** Derived from \`wfsOutputFormat\` (JSON / GeoJSON MIME). */
  wfsSupportsJson: boolean
}

export type AlkisWfsConfig = AlkisWfsDisabled | AlkisWfsEnabled

export type AlkisStateConfigEntry = {
  label: string
  enabled: boolean
  attribution: string | null
  /** Optional human note (endpoint quirks, audit limitations); not used at runtime. */
  specialCaseNote: string | null
  wms: AlkisWmsConfig
  wfs: AlkisWfsConfig
}

/**
 * Auto-generated via \`bun scripts/alkis-wfs/update-config.ts\`.
 * Source data: \`scripts/alkis-wfs/results/audit-results.json\`.
 * Generated at: ${new Date().toISOString()}
 */
export const alkisStateConfig: Record<StateKeyEnum, AlkisStateConfigEntry> = {
${renderedEntries}
}

export function isAlkisBackgroundAvailableForProject(
  alkisStateKey: StateKeyEnum | null | undefined,
) {
  if (alkisStateKey == null) return false
  const entry = alkisStateConfig[alkisStateKey]
  if (entry.enabled !== true) return false
  const hasWms =
    entry.wms.url !== false && Boolean(entry.wms.url.trim() && entry.wms.layerName.trim())
  const hasWfs =
    entry.wfs.url !== false && Boolean(entry.wfs.url.trim() && entry.wfs.parcelPropertyKey.trim())
  return hasWms || hasWfs
}

export function isAlkisWfsAvailableForProject(alkisStateKey: StateKeyEnum | null | undefined) {
  return isAlkisBackgroundAvailableForProject(alkisStateKey)
}

export function getBundeslandSelectOptions() {
  const keys = Object.keys(alkisStateConfig) as StateKeyEnum[]
  const rows = keys.map((key) => {
    const entry = alkisStateConfig[key]
    const disabled = !entry.enabled || key === StateKeyEnum.DISABLED
    let label = entry.label
    if (key === StateKeyEnum.BAYERN) {
      label = \`\${entry.label} (ALKIS-Hintergrund nicht verfügbar)\`
    } else if (key === StateKeyEnum.DISABLED) {
      label = entry.label
    } else if (disabled) {
      label = \`\${entry.label} (nicht verfügbar)\`
    }
    return { key, label, disabled }
  })
  rows.sort((a, b) => a.label.localeCompare(b.label, "de"))
  return [...rows.map((r): [StateKeyEnum, string, boolean] => [r.key, r.label, r.disabled])]
}
`

  const targetPath = join(
    import.meta.dir,
    "..",
    "..",
    "src",
    "app",
    "api",
    "(auth)",
    "[projectSlug]",
    "alkis-wfs-parcels",
    "_utils",
    "alkisStateConfig.ts",
  )
  writeFileSync(targetPath, out, "utf8")
  process.stderr.write(`Updated ${targetPath}\n`)
}

main()
