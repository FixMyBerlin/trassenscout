import db from "@/src/server/db.server"

export type SubsectionRelationSlugFields = {
  operatorSlug?: string
  networkHierarchySlug?: string
  subsectionStatusSlug?: string
}

export type ResolvedSubsectionRelationIds = {
  operatorId?: number
  networkHierarchyId?: number
  subsectionStatusId?: number
}

type MissingSlugMode = "skip" | "error"

async function resolveOneSlug({
  field,
  slug,
  projectId,
  missing,
  find,
}: {
  field: string
  slug: string | undefined
  projectId: number
  missing: MissingSlugMode
  find: (slug: string) => Promise<{ id: number } | null>
}): Promise<number | undefined> {
  if (!slug) return undefined
  const row = await find(slug)
  if (row) return row.id
  if (missing === "skip") return undefined
  throw new Error(`Unknown ${field}: "${slug}" (projectId ${projectId})`)
}

export async function resolveSubsectionRelationSlugs({
  projectId,
  slugs,
  missing,
}: {
  projectId: number
  slugs: SubsectionRelationSlugFields
  missing: MissingSlugMode
}): Promise<ResolvedSubsectionRelationIds> {
  const [operatorId, networkHierarchyId, subsectionStatusId] = await Promise.all([
    resolveOneSlug({
      field: "operatorSlug",
      slug: slugs.operatorSlug,
      projectId,
      missing,
      find: (slug) =>
        db.operator.findFirst({
          where: { slug, projectId },
          select: { id: true },
        }),
    }),
    resolveOneSlug({
      field: "networkHierarchySlug",
      slug: slugs.networkHierarchySlug,
      projectId,
      missing,
      find: (slug) =>
        db.networkHierarchy.findFirst({
          where: { slug, projectId },
          select: { id: true },
        }),
    }),
    resolveOneSlug({
      field: "subsectionStatusSlug",
      slug: slugs.subsectionStatusSlug,
      projectId,
      missing,
      find: (slug) =>
        db.subsectionStatus.findFirst({
          where: { slug, projectId },
          select: { id: true },
        }),
    }),
  ])

  return { operatorId, networkHierarchyId, subsectionStatusId }
}
