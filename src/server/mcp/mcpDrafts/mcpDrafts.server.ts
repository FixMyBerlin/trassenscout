import type { Prisma } from "@/src/prisma/generated/client"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { overlaySubsubsectionMcpDraft } from "@/src/server/mcp/subsubsectionUpdate/overlaySubsubsectionMcpDraft"
import { subsubsectionMcpPatchFieldLabels } from "@/src/server/mcp/subsubsectionUpdate/patchFieldLabel"
import type {
  SubsubsectionMcpCreatePatch,
  SubsubsectionMcpPatch,
} from "@/src/server/mcp/subsubsectionUpdate/patchSchema"
import { subsubsectionMcpPatchOverlaySchema } from "@/src/server/mcp/subsubsectionUpdate/patchSchema"
import { parseExtraFields } from "@/src/shared/subsubsections/extraFieldSchemas"

export async function upsertSubsubsectionMcpDraft({
  createdById,
  projectId,
  subsubsectionId,
  patch,
}: {
  createdById: number
  projectId: number
  subsubsectionId: number
  patch: SubsubsectionMcpPatch
}) {
  const serializedPatch = JSON.parse(JSON.stringify(patch)) as Prisma.InputJsonValue
  return db.mcpDraft.upsert({
    where: { subsubsectionId },
    create: {
      createdById,
      projectId,
      subsubsectionId,
      patch: serializedPatch,
    },
    update: {
      createdById,
      projectId,
      patch: serializedPatch,
    },
  })
}

export async function upsertSubsubsectionMcpCreateDraft({
  createdById,
  projectId,
  subsectionId,
  slug,
  patch,
}: {
  createdById: number
  projectId: number
  subsectionId: number
  slug: string
  patch: SubsubsectionMcpCreatePatch
}) {
  const serializedPatch = JSON.parse(JSON.stringify(patch)) as Prisma.InputJsonValue
  return db.mcpDraft.upsert({
    where: { subsectionId_slug: { subsectionId, slug } },
    create: {
      createdById,
      projectId,
      subsectionId,
      slug,
      patch: serializedPatch,
    },
    update: {
      createdById,
      projectId,
      patch: serializedPatch,
    },
  })
}

async function overlayFromDraft({
  patch,
  extraFieldDefinitions,
  projectId,
  currentExtraFields,
}: {
  patch: Prisma.JsonValue
  extraFieldDefinitions: unknown
  projectId: number
  currentExtraFields: Record<string, string>
}) {
  const parsedPatch = subsubsectionMcpPatchOverlaySchema.safeParse(patch)
  const formOverlay = await overlaySubsubsectionMcpDraft({
    patch,
    extraFieldDefinitions,
    projectId,
    currentExtraFields,
  })
  return {
    fieldLabels: parsedPatch.success ? subsubsectionMcpPatchFieldLabels(parsedPatch.data) : [],
    patch: (parsedPatch.success ? parsedPatch.data : patch) as Prisma.JsonValue,
    formOverlay,
  }
}

type SubsubsectionMcpDraftPayload = {
  id: number
  kind: "update" | "create"
  updatedAt: Date
  createdBy: { firstName: string; lastName: string; email: string }
  slug: string
  fieldLabels: string[]
  patch: Prisma.JsonValue
  formOverlay: Awaited<ReturnType<typeof overlaySubsubsectionMcpDraft>>
}

export async function getSubsubsectionMcpDraft(
  headers: Headers,
  input: { projectSlug: string; subsectionSlug: string; subsubsectionSlug: string },
) {
  await endpointAuth.admin(headers)

  const subsubsection = await db.subsubsection.findFirst({
    where: {
      slug: input.subsubsectionSlug,
      subsection: {
        slug: input.subsectionSlug,
        project: { slug: input.projectSlug },
      },
    },
    select: {
      id: true,
      extraFields: true,
      subsection: {
        select: {
          projectId: true,
          project: { select: { subsubsectionExtraFieldDefinitions: true } },
        },
      },
    },
  })

  if (subsubsection) {
    const draft = await db.mcpDraft.findUnique({
      where: { subsubsectionId: subsubsection.id },
      select: {
        id: true,
        updatedAt: true,
        patch: true,
        createdBy: { select: { firstName: true, lastName: true, email: true } },
      },
    })
    if (!draft) return null
    const overlay = await overlayFromDraft({
      patch: draft.patch,
      extraFieldDefinitions: subsubsection.subsection.project.subsubsectionExtraFieldDefinitions,
      projectId: subsubsection.subsection.projectId,
      currentExtraFields: parseExtraFields(subsubsection.extraFields),
    })
    return {
      id: draft.id,
      kind: "update" as const,
      updatedAt: draft.updatedAt,
      createdBy: draft.createdBy,
      slug: input.subsubsectionSlug,
      ...overlay,
    } satisfies SubsubsectionMcpDraftPayload
  }

  const subsection = await db.subsection.findFirst({
    where: {
      slug: input.subsectionSlug,
      project: { slug: input.projectSlug },
    },
    select: {
      id: true,
      projectId: true,
      project: { select: { subsubsectionExtraFieldDefinitions: true } },
    },
  })
  if (!subsection) return null

  const draft = await db.mcpDraft.findUnique({
    where: {
      subsectionId_slug: { subsectionId: subsection.id, slug: input.subsubsectionSlug },
    },
    select: {
      id: true,
      updatedAt: true,
      patch: true,
      slug: true,
      createdBy: { select: { firstName: true, lastName: true, email: true } },
    },
  })
  if (!draft) return null

  const overlay = await overlayFromDraft({
    patch: draft.patch,
    extraFieldDefinitions: subsection.project.subsubsectionExtraFieldDefinitions,
    projectId: subsection.projectId,
    currentExtraFields: {},
  })
  return {
    id: draft.id,
    kind: "create" as const,
    updatedAt: draft.updatedAt,
    createdBy: draft.createdBy,
    slug: draft.slug ?? input.subsubsectionSlug,
    ...overlay,
    formOverlay: { slug: draft.slug ?? input.subsubsectionSlug, ...overlay.formOverlay },
  } satisfies SubsubsectionMcpDraftPayload
}

export async function deleteSubsubsectionMcpCreateDraftBySlug(subsectionId: number, slug: string) {
  return db.mcpDraft.deleteMany({
    where: { subsectionId, slug, subsubsectionId: null },
  })
}

export async function deleteSubsubsectionMcpDraft(
  headers: Headers,
  input: { projectSlug: string; subsubsectionId?: number; id?: number },
) {
  await endpointAuth.admin(headers)

  return db.mcpDraft.deleteMany({
    where: {
      project: { slug: input.projectSlug },
      ...(input.id !== undefined ? { id: input.id } : { subsubsectionId: input.subsubsectionId }),
    },
  })
}

export async function listSubsectionMcpCreateDrafts(
  headers: Headers,
  input: { projectSlug: string; subsectionSlug: string },
) {
  await endpointAuth.admin(headers)

  const subsection = await db.subsection.findFirst({
    where: { slug: input.subsectionSlug, project: { slug: input.projectSlug } },
    select: { id: true },
  })
  if (!subsection) return { drafts: [] }

  const drafts = await db.mcpDraft.findMany({
    where: { subsectionId: subsection.id, subsubsectionId: null },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      updatedAt: true,
      createdBy: { select: { firstName: true, lastName: true, email: true } },
    },
  })

  return { drafts }
}

export async function listMcpDraftsGrouped(headers: Headers) {
  await endpointAuth.admin(headers)

  const drafts = await db.mcpDraft.findMany({
    orderBy: [{ project: { slug: "asc" } }, { updatedAt: "desc" }],
    select: {
      id: true,
      updatedAt: true,
      slug: true,
      createdBy: { select: { firstName: true, lastName: true, email: true } },
      project: { select: { slug: true, subTitle: true } },
      subsection: { select: { slug: true } },
      subsubsection: {
        select: {
          slug: true,
          subsection: { select: { slug: true } },
        },
      },
    },
  })

  const groups: {
    projectSlug: string
    projectSubTitle: string | null
    drafts: {
      id: number
      updatedAt: Date
      createdBy: { firstName: string; lastName: string; email: string }
      kind: "update" | "create"
      subsectionSlug: string | null
      subsubsectionSlug: string | null
    }[]
  }[] = []
  const groupIndexBySlug = new Map<string, number>()

  for (const draft of drafts) {
    let groupIndex = groupIndexBySlug.get(draft.project.slug)
    if (groupIndex === undefined) {
      groupIndex = groups.length
      groupIndexBySlug.set(draft.project.slug, groupIndex)
      groups.push({
        projectSlug: draft.project.slug,
        projectSubTitle: draft.project.subTitle,
        drafts: [],
      })
    }

    const isCreate = draft.subsubsection === null
    groups[groupIndex]!.drafts.push({
      id: draft.id,
      updatedAt: draft.updatedAt,
      createdBy: draft.createdBy,
      kind: isCreate ? "create" : "update",
      subsectionSlug: draft.subsubsection?.subsection.slug ?? draft.subsection?.slug ?? null,
      subsubsectionSlug: draft.subsubsection?.slug ?? draft.slug ?? null,
    })
  }

  return { groups, total: drafts.length }
}
