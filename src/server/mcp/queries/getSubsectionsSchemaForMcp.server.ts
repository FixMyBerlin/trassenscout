import { GeometryTypeEnum } from "@/src/prisma/generated/browser"
import db from "@/src/server/db.server"
import { requireMcpEnabledProject } from "@/src/server/mcp/requireMcpEnabledProject.server"

type SchemaField = {
  name: string
  label: string
  type: string
  required: boolean
  writable: boolean
}

function schemaFields(): SchemaField[] {
  return [
    { name: "slug", label: "Kürzel", type: "String", required: true, writable: false },
    {
      name: "type",
      label: "Geometrietyp",
      type: "GeometryTypeEnum LINE|POLYGON",
      required: true,
      writable: false,
    },
    { name: "geometry", label: "Geometrie", type: "GeoJSON", required: true, writable: false },
    {
      name: "description",
      label: "Beschreibung",
      type: "String",
      required: false,
      writable: true,
    },
    {
      name: "lengthM",
      label: "Länge",
      type: "Float",
      required: false,
      writable: true,
    },
    {
      name: "estimatedCompletionDateString",
      label: "Jahr und Monat der geplanten Fertigstellung",
      type: "String YYYY-MM",
      required: false,
      writable: true,
    },
    {
      name: "operatorSlug",
      label: "Baulastträger",
      type: "Slug (see operators)",
      required: false,
      writable: true,
    },
    {
      name: "networkHierarchySlug",
      label: "Netzstufe",
      type: "Slug (see networkHierarchies)",
      required: false,
      writable: true,
    },
    {
      name: "subsectionStatusSlug",
      label: "Status",
      type: "Slug (see subsectionStatuses)",
      required: false,
      writable: true,
    },
  ]
}

export async function getSubsectionsSchemaForMcp(projectSlug: string) {
  const project = await requireMcpEnabledProject(projectSlug)

  const [operators, networkHierarchies, subsectionStatuses] = await Promise.all([
    db.operator.findMany({
      where: { projectId: project.id },
      select: { id: true, slug: true, title: true },
      orderBy: { slug: "asc" },
    }),
    db.networkHierarchy.findMany({
      where: { projectId: project.id },
      select: { id: true, slug: true, title: true },
      orderBy: { slug: "asc" },
    }),
    db.subsectionStatus.findMany({
      where: { projectId: project.id },
      select: { id: true, slug: true, title: true },
      orderBy: { slug: "asc" },
    }),
  ])

  return {
    projectSlug: project.slug,
    notes: [
      "Relations use slugs, not IDs. Options are in this payload (operators, networkHierarchies, subsectionStatuses).",
      "MCP patch: omit a key to leave it unchanged. null and empty string do not clear values.",
      `type is not writable on subsections_update. subsections_create requires type (${GeometryTypeEnum.LINE} | ${GeometryTypeEnum.POLYGON}) and matching GeoJSON geometry in the patch. POINT is not allowed.`,
      "slug is identity on both tools; for create it is the proposed Kürzel and must be unique within the project.",
      "labelPos defaults to bottom on create and is not MCP-writable. order is assigned as maxOrder + 1 on apply.",
    ],
    fields: schemaFields(),
    operators,
    networkHierarchies,
    subsectionStatuses,
  }
}
