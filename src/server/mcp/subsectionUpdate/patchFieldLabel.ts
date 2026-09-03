import type {
  SubsectionMcpCreatePatch,
  SubsectionMcpPatch,
} from "@/src/server/mcp/subsectionUpdate/patchSchema"

const subsectionMcpFieldLabels: Record<string, string> = {
  description: "Beschreibung",
  lengthM: "Länge",
  estimatedCompletionDateString: "Jahr und Monat der geplanten Fertigstellung",
  operatorSlug: "Baulastträger",
  networkHierarchySlug: "Netzstufe",
  subsectionStatusSlug: "Status",
  type: "Geometrietyp",
  geometry: "Geometrie",
}

export function subsectionMcpFieldLabel(field: string) {
  return subsectionMcpFieldLabels[field] ?? field
}

export function subsectionMcpPatchFieldLabels(
  patch: SubsectionMcpPatch | SubsectionMcpCreatePatch,
) {
  const labels: string[] = []
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue
    labels.push(subsectionMcpFieldLabel(key))
  }
  return labels
}
