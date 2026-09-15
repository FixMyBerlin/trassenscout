import { subsubsectionLocationLabelMap } from "@/src/components/core/utils/subsubsectionLocationLabelMap"
import { GeometryTypeEnum, LocationEnum } from "@/src/prisma/generated/browser"
import db from "@/src/server/db.server"
import { requireMcpEnabledProject } from "@/src/server/mcp/requireMcpEnabledProject.server"
import { parseDefinitions } from "@/src/shared/subsubsections/extraFieldSchemas"
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

function enumOptions<T extends Record<string, string>>(
  values: T,
  titles?: Partial<Record<keyof T, string>>,
) {
  return Object.values(values).map((slug) => ({
    slug,
    title: titles?.[slug as keyof T] ?? slug,
  }))
}

function schemaFields(): SchemaField[] {
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
      type: "Slug (see qualityLevels)",
      required: false,
      writable: true,
    },
    {
      name: "subsubsectionStatusSlug",
      label: subsubsectionFieldTranslations.subsubsectionStatusId,
      type: "Slug (see subsubsectionStatuses)",
      required: false,
      writable: true,
    },
    {
      name: "subsubsectionTaskSlug",
      label: subsubsectionFieldTranslations.subsubsectionTaskId,
      type: "Slug (see subsubsectionTasks)",
      required: false,
      writable: true,
    },
    {
      name: "subsubsectionInfraSlug",
      label: subsubsectionFieldTranslations.subsubsectionInfraId,
      type: "Slug (see subsubsectionInfras)",
      required: false,
      writable: true,
    },
    {
      name: "subsubsectionInfrastructureTypeSlugs",
      label: subsubsectionFieldTranslations.subsubsectionInfrastructureTypeIds,
      type: "Slug[] full-replace (see subsubsectionInfrastructureTypes)",
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

  return fields
}

export async function getSubsubsectionsSchemaForMcp(projectSlug: string) {
  const project = await requireMcpEnabledProject(projectSlug)

  const extraFields = parseDefinitions(project.subsubsectionExtraFieldDefinitions).map(
    (definition) => ({
      name: definition.name,
      label: definition.label,
      order: definition.order,
    }),
  )

  const [
    qualityLevels,
    subsubsectionStatuses,
    subsubsectionTasks,
    subsubsectionInfras,
    subsubsectionInfrastructureTypes,
  ] = await Promise.all([
    db.qualityLevel.findMany({
      where: { projectId: project.id },
      select: { id: true, slug: true, title: true },
      orderBy: { slug: "asc" },
    }),
    db.subsubsectionStatus.findMany({
      where: { projectId: project.id },
      select: { id: true, slug: true, title: true },
      orderBy: { slug: "asc" },
    }),
    db.subsubsectionTask.findMany({
      where: { projectId: project.id },
      select: { id: true, slug: true, title: true },
      orderBy: { slug: "asc" },
    }),
    db.subsubsectionInfra.findMany({
      where: { projectId: project.id },
      select: { id: true, slug: true, title: true },
      orderBy: { slug: "asc" },
    }),
    db.subsubsectionInfrastructureType.findMany({
      where: { projectId: project.id },
      select: { id: true, slug: true, title: true },
      orderBy: { slug: "asc" },
    }),
  ])

  return {
    projectSlug: project.slug,
    notes: [
      "Relations use slugs, not IDs. Options are in this payload (qualityLevels, subsubsectionStatuses, subsubsectionTasks, subsubsectionInfras, subsubsectionInfrastructureTypes, location).",
      "extraFields keys are listed in extraFields (project-specific).",
      "MCP patch: omit a key to leave it unchanged. null and empty string do not clear values.",
      "subsubsectionInfrastructureTypeSlugs: omit to leave unchanged; present with ≥1 slug = replace the whole set (empty array rejected).",
      `type (GeometryTypeEnum) is not writable on subsubsections_update: ${Object.values(GeometryTypeEnum).join(", ")}. subsubsections_create requires type and matching GeoJSON geometry in the patch.`,
      "slug is identity on both tools; for create it is the proposed Kürzel and must be unique within the Planungsabschnitt.",
      "labelPos defaults to bottom on create and is not MCP-writable.",
    ],
    fields: schemaFields(),
    extraFields,
    qualityLevels,
    subsubsectionStatuses,
    subsubsectionTasks,
    subsubsectionInfras,
    subsubsectionInfrastructureTypes,
    location: enumOptions(LocationEnum, subsubsectionLocationLabelMap),
  }
}
