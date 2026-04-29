#!/usr/bin/env bun
import { alkisStateConfig } from "@/src/server/alkis/alkisStateConfig.data"
import type {
  AlkisStateConfigEntry,
  AlkisWfsConfig,
  AlkisWmsConfig,
} from "@/src/server/alkis/alkisStateConfig.types"
import { StateKeyEnum } from "@prisma/client"
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { AUDIT_SCHEMA_VERSION } from "./shared/constants"

function renderHeader(generatedAt: string): string {
  return `// Hybrid file maintained by scripts/alkis-wfs/update-config.ts.
//
// Auto-managed (overwritten by \`bun scripts/alkis-wfs/update-config.ts\`
// when the latest audit verifies a state):
//   wfs.* — url, parcelPropertyKey, alkisParcelIdPropertyKey, projection,
//           wfsOutputFormat, supports4326, bboxAxisOrder, wfsSupportsJson
//
// Manually maintained (edit directly here; the script reads them back
// and carries them forward unchanged on regeneration):
//   label, enabled, attribution, specialCaseNote, wms
//
// See ./README.md
//
// Last regen: ${generatedAt}`
}

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

function renderAttribution(attribution: AlkisStateConfigEntry["attribution"]): string[] {
  if (attribution === null) {
    return ["    attribution: null,"]
  }
  return [
    "    attribution: {",
    `      text: ${JSON.stringify(attribution.text)},`,
    `      url: ${JSON.stringify(attribution.url)},`,
    `      license: ${JSON.stringify(attribution.license)},`,
    "    },",
  ]
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
  lines.push(...renderAttribution(next.attribution))
  lines.push(`    specialCaseNote: ${toLiteral(next.specialCaseNote)},`)
  lines.push(...renderWms(next.wms))
  lines.push(...renderWfs(next.wfs as AlkisWfsConfig))
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

  const generatedAt = new Date().toISOString()
  const out = `${renderHeader(generatedAt)}

import { StateKeyEnum } from "@prisma/client"
import type { AlkisStateConfigEntry } from "./alkisStateConfig.types"

export const alkisStateConfig: Record<StateKeyEnum, AlkisStateConfigEntry> = {
${renderedEntries}
}
`

  const targetPath = join(
    import.meta.dir,
    "..",
    "..",
    "src",
    "server",
    "alkis",
    "alkisStateConfig.data.ts",
  )
  writeFileSync(targetPath, out, "utf8")
  process.stderr.write(`Updated ${targetPath}\n`)
}

main()
