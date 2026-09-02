import type { SubsubsectionMcpPatch } from "@/src/server/mcp/subsubsectionUpdate/patchSchema"
import { subsubsectionFieldTranslations } from "@/src/shared/subsubsections/subsubsectionFieldMappings"

const SLUG_FIELD_LABELS: Record<string, string> = {
  qualityLevelSlug: subsubsectionFieldTranslations.qualityLevelId,
  subsubsectionStatusSlug: subsubsectionFieldTranslations.subsubsectionStatusId,
  subsubsectionTaskSlug: subsubsectionFieldTranslations.subsubsectionTaskId,
  subsubsectionInfraSlug: subsubsectionFieldTranslations.subsubsectionInfraId,
  subsubsectionInfrastructureTypeSlugs:
    subsubsectionFieldTranslations.subsubsectionInfrastructureTypeIds,
}

export function subsubsectionMcpFieldLabel(field: string) {
  if (field.startsWith("extraFields.")) {
    return field.slice("extraFields.".length)
  }
  if (field in subsubsectionFieldTranslations) {
    return subsubsectionFieldTranslations[field as keyof typeof subsubsectionFieldTranslations]
  }
  return SLUG_FIELD_LABELS[field] ?? field
}

export function subsubsectionMcpPatchFieldLabels(patch: SubsubsectionMcpPatch) {
  const labels: string[] = []
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue
    if (key === "extraFields" && value && typeof value === "object") {
      for (const extraKey of Object.keys(value as Record<string, string>)) {
        labels.push(extraKey)
      }
      continue
    }
    labels.push(subsubsectionMcpFieldLabel(key))
  }
  return labels
}
