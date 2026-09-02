import type { Prisma } from "@/src/prisma/generated/client"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { overlaySubsubsectionMcpDraft } from "@/src/server/mcp/subsubsectionUpdate/overlaySubsubsectionMcpDraft"
import { subsubsectionMcpPatchFieldLabels } from "@/src/server/mcp/subsubsectionUpdate/patchFieldLabel"
import type { SubsubsectionMcpPatch } from "@/src/server/mcp/subsubsectionUpdate/patchSchema"
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
  if (!subsubsection) return null

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

  const parsedPatch = subsubsectionMcpPatchOverlaySchema.safeParse(draft.patch)
  const formOverlay = await overlaySubsubsectionMcpDraft({
    patch: draft.patch,
    extraFieldDefinitions: subsubsection.subsection.project.subsubsectionExtraFieldDefinitions,
    projectId: subsubsection.subsection.projectId,
    currentExtraFields: parseExtraFields(subsubsection.extraFields),
  })

  return {
    id: draft.id,
    updatedAt: draft.updatedAt,
    createdBy: draft.createdBy,
    fieldLabels: parsedPatch.success ? subsubsectionMcpPatchFieldLabels(parsedPatch.data) : [],
    patch: parsedPatch.success ? parsedPatch.data : draft.patch,
    formOverlay,
  }
}

export async function deleteSubsubsectionMcpDraft(
  headers: Headers,
  input: { projectSlug: string; subsubsectionId: number },
) {
  await endpointAuth.admin(headers)

  return db.mcpDraft.deleteMany({
    where: {
      subsubsectionId: input.subsubsectionId,
      project: { slug: input.projectSlug },
    },
  })
}

export async function listMcpDraftsGrouped(headers: Headers) {
  await endpointAuth.admin(headers)

  const drafts = await db.mcpDraft.findMany({
    orderBy: [{ project: { slug: "asc" } }, { updatedAt: "desc" }],
    select: {
      id: true,
      updatedAt: true,
      createdBy: { select: { firstName: true, lastName: true, email: true } },
      project: { select: { slug: true, subTitle: true } },
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

    groups[groupIndex]!.drafts.push({
      id: draft.id,
      updatedAt: draft.updatedAt,
      createdBy: draft.createdBy,
      subsectionSlug: draft.subsubsection?.subsection.slug ?? null,
      subsubsectionSlug: draft.subsubsection?.slug ?? null,
    })
  }

  return { groups, total: drafts.length }
}
