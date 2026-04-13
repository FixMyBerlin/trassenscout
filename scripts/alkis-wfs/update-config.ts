#!/usr/bin/env bun
import {
  alkisStateConfig,
  type AlkisStateConfigEntry,
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

function renderEntry(
  key: StateKeyEnum,
  base: AlkisStateConfigEntry,
  audit: AuditStateResult | undefined,
): string {
  /** Strict: only true when audit JSON has boolean `verified: true` (never TODO for verified states). */
  const isAuditVerified = audit?.verified === true
  const useSuggested = isAuditVerified
  const suggested = audit?.suggestedConfig
  const next = {
    label: base.label,
    enabled: base.enabled,
    wmsUrl: base.wmsUrl,
    layerName: base.layerName,
    wfsUrl: useSuggested ? (suggested?.wfsUrl ?? base.wfsUrl) : base.wfsUrl,
    parcelPropertyKey: useSuggested
      ? (suggested?.parcelPropertyKey ?? base.parcelPropertyKey)
      : base.parcelPropertyKey,
    alkisParcelIdPropertyKey: useSuggested
      ? (suggested?.alkisParcelIdPropertyKey ?? base.alkisParcelIdPropertyKey)
      : base.alkisParcelIdPropertyKey,
    projection: useSuggested ? (suggested?.projection ?? base.projection) : base.projection,
    attribution: base.attribution,
    specialCaseNote: base.specialCaseNote,
    wfsOutputFormat: useSuggested
      ? (suggested?.wfsOutputFormat ?? base.wfsOutputFormat)
      : base.wfsOutputFormat,
    supports4326: useSuggested ? (suggested?.supports4326 ?? base.supports4326) : base.supports4326,
    bboxAxisOrder: useSuggested
      ? (suggested?.bboxAxisOrder ?? base.bboxAxisOrder)
      : base.bboxAxisOrder,
    wfsSupportsJson: (
      (useSuggested
        ? (suggested?.wfsOutputFormat ?? base.wfsOutputFormat)
        : base.wfsOutputFormat) ?? ""
    )
      .toLowerCase()
      .includes("json"),
  } as const

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
  lines.push(`    wmsUrl: ${toLiteral(next.wmsUrl)},`)
  lines.push(`    layerName: ${toLiteral(next.layerName)},`)
  lines.push(`    wfsUrl: ${toLiteral(next.wfsUrl)},`)
  lines.push(`    parcelPropertyKey: ${toLiteral(next.parcelPropertyKey)},`)
  lines.push(`    alkisParcelIdPropertyKey: ${toLiteral(next.alkisParcelIdPropertyKey)},`)
  lines.push(`    projection: ${toLiteral(next.projection)},`)
  lines.push(`    attribution: ${toLiteral(next.attribution)},`)
  lines.push(`    specialCaseNote: ${toLiteral(next.specialCaseNote)},`)
  lines.push(`    wfsOutputFormat: ${toLiteral(next.wfsOutputFormat)},`)
  lines.push(`    supports4326: ${next.supports4326},`)
  lines.push(`    bboxAxisOrder: ${JSON.stringify(next.bboxAxisOrder)},`)
  lines.push(`    wfsSupportsJson: ${next.wfsSupportsJson},`)
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

export type AlkisStateConfigEntry = {
  label: string
  enabled: boolean
  wmsUrl: string | null
  layerName: string | null
  wfsUrl: string | null
  parcelPropertyKey: string | null
  alkisParcelIdPropertyKey: string | null
  attribution: string | null
  /** Optional human note (endpoint quirks, audit limitations); not used at runtime. */
  specialCaseNote: string | null
  projection: "EPSG:25832" | "EPSG:25833" | null
  wfsOutputFormat: string | null
  supports4326: boolean
  bboxAxisOrder: "lonlat" | "latlon"
  wfsSupportsJson: boolean
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
  const hasWms = Boolean(entry.wmsUrl?.trim() && entry.layerName?.trim())
  const hasWfs = Boolean(entry.wfsUrl?.trim() && entry.parcelPropertyKey?.trim())
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
