import { GeometryTypeEnum } from "@/src/prisma/generated/browser"
import {
  fieldDataTypes,
  requiredFields,
  subsubsectionFieldTranslations,
} from "@/src/shared/subsubsections/subsubsectionFieldMappings"

const NOT_WRITABLE = new Set([
  "slug",
  "geometry",
  "type",
  "subsectionId",
  "subTitle",
  "widthExisting",
  "mapillaryKey",
  "specialFeatures",
  "qualityLevelId",
  "subsubsectionStatusId",
  "subsubsectionTaskId",
  "subsubsectionInfraId",
  "subsubsectionInfrastructureTypeIds",
  "managerId",
  "labelPos",
])

type SchemaField = {
  name: string
  label: string
  type: string
  required: boolean
  writable: boolean
}

export function getFuehrungenSchemaForMcp() {
  const fields: SchemaField[] = Object.entries(subsubsectionFieldTranslations).map(
    ([name, label]) => ({
      name,
      label,
      type: fieldDataTypes[name as keyof typeof fieldDataTypes] ?? "Unknown",
      required: requiredFields.includes(name as (typeof requiredFields)[number]),
      writable: !NOT_WRITABLE.has(name),
    }),
  )

  fields.push(
    {
      name: "qualityLevelSlug",
      label: subsubsectionFieldTranslations.qualityLevelId,
      type: "Slug (see fuehrungen_enums.qualityLevels)",
      required: false,
      writable: true,
    },
    {
      name: "subsubsectionStatusSlug",
      label: subsubsectionFieldTranslations.subsubsectionStatusId,
      type: "Slug (see fuehrungen_enums.subsubsectionStatuses)",
      required: false,
      writable: true,
    },
    {
      name: "subsubsectionTaskSlug",
      label: subsubsectionFieldTranslations.subsubsectionTaskId,
      type: "Slug (see fuehrungen_enums.subsubsectionTasks)",
      required: false,
      writable: true,
    },
    {
      name: "subsubsectionInfraSlug",
      label: subsubsectionFieldTranslations.subsubsectionInfraId,
      type: "Slug (see fuehrungen_enums.subsubsectionInfras)",
      required: false,
      writable: true,
    },
    {
      name: "subsubsectionInfrastructureTypeSlugs",
      label: subsubsectionFieldTranslations.subsubsectionInfrastructureTypeIds,
      type: "Slug[] full-replace (see fuehrungen_enums.subsubsectionInfrastructureTypes)",
      required: false,
      writable: true,
    },
    {
      name: "extraFields",
      label: "Zusatzfelder",
      type: "Record<string,string>",
      required: false,
      writable: true,
    },
  )

  return {
    notes: [
      "Relations use slugs, not IDs. Options: fuehrungen_enums.",
      "extraFields keys come from fuehrungen_extra_fields (project-specific).",
      "MCP patch: omit a key to leave it unchanged. null and empty string do not clear values.",
      "subsubsectionInfrastructureTypeSlugs: omit to leave unchanged; present with ≥1 slug = replace the whole set (empty array rejected).",
      `type (GeometryTypeEnum) is documented only, not writable: ${Object.values(GeometryTypeEnum).join(", ")}`,
    ],
    fields,
  }
}
