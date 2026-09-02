import db from "@/src/server/db.server"

export type SubsubsectionRelationSlugFields = {
  qualityLevelSlug?: string
  subsubsectionStatusSlug?: string
  subsubsectionInfraSlug?: string
  subsubsectionTaskSlug?: string
}

export type ResolvedSubsubsectionRelationIds = {
  qualityLevelId?: number
  subsubsectionStatusId?: number
  subsubsectionInfraId?: number
  subsubsectionTaskId?: number
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

export async function resolveSubsubsectionRelationSlugs({
  projectId,
  slugs,
  missing,
}: {
  projectId: number
  slugs: SubsubsectionRelationSlugFields
  missing: MissingSlugMode
}): Promise<ResolvedSubsubsectionRelationIds> {
  const [qualityLevelId, subsubsectionStatusId, subsubsectionInfraId, subsubsectionTaskId] =
    await Promise.all([
      resolveOneSlug({
        field: "qualityLevelSlug",
        slug: slugs.qualityLevelSlug,
        projectId,
        missing,
        find: (slug) =>
          db.qualityLevel.findFirst({
            where: { slug, projectId },
            select: { id: true },
          }),
      }),
      resolveOneSlug({
        field: "subsubsectionStatusSlug",
        slug: slugs.subsubsectionStatusSlug,
        projectId,
        missing,
        find: (slug) =>
          db.subsubsectionStatus.findFirst({
            where: { slug, projectId },
            select: { id: true },
          }),
      }),
      resolveOneSlug({
        field: "subsubsectionInfraSlug",
        slug: slugs.subsubsectionInfraSlug,
        projectId,
        missing,
        find: (slug) =>
          db.subsubsectionInfra.findFirst({
            where: { slug, projectId },
            select: { id: true },
          }),
      }),
      resolveOneSlug({
        field: "subsubsectionTaskSlug",
        slug: slugs.subsubsectionTaskSlug,
        projectId,
        missing,
        find: (slug) =>
          db.subsubsectionTask.findFirst({
            where: { slug, projectId },
            select: { id: true },
          }),
      }),
    ])

  return {
    qualityLevelId,
    subsubsectionStatusId,
    subsubsectionInfraId,
    subsubsectionTaskId,
  }
}

export async function resolveSubsubsectionInfrastructureTypeSlugs({
  projectId,
  slugs,
  missing,
}: {
  projectId: number
  slugs: string[]
  missing: MissingSlugMode
}): Promise<number[]> {
  const ids: number[] = []
  const uniqueSlugs = new Set(slugs)
  for (const slug of uniqueSlugs) {
    const row = await db.subsubsectionInfrastructureType.findFirst({
      where: { slug, projectId },
      select: { id: true },
    })
    if (row) {
      ids.push(row.id)
      continue
    }
    if (missing === "skip") continue
    throw new Error(
      `Unknown subsubsectionInfrastructureTypeSlugs: "${slug}" (projectId ${projectId})`,
    )
  }
  return ids
}
