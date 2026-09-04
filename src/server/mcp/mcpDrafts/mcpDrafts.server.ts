import { McpDraftKind, Prisma } from "@/src/prisma/generated/client"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"
import { overlaySubsectionMcpDraft } from "@/src/server/mcp/subsectionUpdate/overlaySubsectionMcpDraft"
import { subsectionMcpPatchFieldLabels } from "@/src/server/mcp/subsectionUpdate/patchFieldLabel"
import type {
  SubsectionMcpCreatePatch,
  SubsectionMcpPatch,
} from "@/src/server/mcp/subsectionUpdate/patchSchema"
import {
  subsectionMcpCreatePatchOverlaySchema,
  subsectionMcpPatchOverlaySchema,
} from "@/src/server/mcp/subsectionUpdate/patchSchema"
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
      kind: McpDraftKind.SUBSUBSECTION_UPDATE,
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
  parentSubsectionId,
  slug,
  patch,
}: {
  createdById: number
  projectId: number
  parentSubsectionId: number
  slug: string
  patch: SubsubsectionMcpCreatePatch
}) {
  const serializedPatch = JSON.parse(JSON.stringify(patch)) as Prisma.InputJsonValue
  return db.mcpDraft.upsert({
    where: { parentSubsectionId_slug: { parentSubsectionId, slug } },
    create: {
      kind: McpDraftKind.SUBSUBSECTION_CREATE,
      createdById,
      projectId,
      parentSubsectionId,
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

export async function upsertSubsectionMcpDraft({
  createdById,
  projectId,
  subsectionId,
  patch,
}: {
  createdById: number
  projectId: number
  subsectionId: number
  patch: SubsectionMcpPatch
}) {
  const serializedPatch = JSON.parse(JSON.stringify(patch)) as Prisma.InputJsonValue
  return db.mcpDraft.upsert({
    where: { subsectionId },
    create: {
      kind: McpDraftKind.SUBSECTION_UPDATE,
      createdById,
      projectId,
      subsectionId,
      patch: serializedPatch,
    },
    update: {
      createdById,
      projectId,
      patch: serializedPatch,
    },
  })
}

export async function upsertSubsectionMcpCreateDraft({
  createdById,
  projectId,
  slug,
  patch,
}: {
  createdById: number
  projectId: number
  slug: string
  patch: SubsectionMcpCreatePatch
}) {
  const serializedPatch = JSON.parse(JSON.stringify(patch)) as Prisma.InputJsonValue

  try {
    return await db.mcpDraft.create({
      data: {
        kind: McpDraftKind.SUBSECTION_CREATE,
        createdById,
        projectId,
        slug,
        patch: serializedPatch,
      },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existing = await db.mcpDraft.findFirst({
        where: { kind: McpDraftKind.SUBSECTION_CREATE, projectId, slug },
        select: { id: true },
      })
      if (existing) {
        return db.mcpDraft.update({
          where: { id: existing.id },
          data: { createdById, patch: serializedPatch },
        })
      }
    }
    throw error
  }
}

async function overlayFromSubsubsectionDraft({
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

async function overlayFromSubsectionDraft({
  patch,
  projectId,
  createDraft,
}: {
  patch: Prisma.JsonValue
  projectId: number
  createDraft: boolean
}) {
  const overlaySchema = createDraft
    ? subsectionMcpCreatePatchOverlaySchema
    : subsectionMcpPatchOverlaySchema
  const parsedPatch = overlaySchema.safeParse(patch)
  const { overlay, overlayErrors } = await overlaySubsectionMcpDraft({
    patch,
    projectId,
    createDraft,
  })
  return {
    fieldLabels: parsedPatch.success ? subsectionMcpPatchFieldLabels(parsedPatch.data) : [],
    patch: (parsedPatch.success ? parsedPatch.data : patch) as Prisma.JsonValue,
    formOverlay: overlay,
    overlayErrors,
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

type SubsectionMcpDraftPayload = {
  id: number
  kind: "update" | "create"
  updatedAt: Date
  createdBy: { firstName: string; lastName: string; email: string }
  slug: string
  fieldLabels: string[]
  patch: Prisma.JsonValue
  formOverlay: Awaited<ReturnType<typeof overlaySubsectionMcpDraft>>["overlay"]
  overlayErrors: string[]
}

const draftAuthorSelect = { firstName: true, lastName: true, email: true } as const

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
        createdBy: { select: draftAuthorSelect },
      },
    })
    if (!draft) return null
    const overlay = await overlayFromSubsubsectionDraft({
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
      parentSubsectionId_slug: {
        parentSubsectionId: subsection.id,
        slug: input.subsubsectionSlug,
      },
    },
    select: {
      id: true,
      updatedAt: true,
      patch: true,
      slug: true,
      createdBy: { select: draftAuthorSelect },
    },
  })
  if (!draft) return null

  const overlay = await overlayFromSubsubsectionDraft({
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

export async function getSubsectionMcpDraft(
  headers: Headers,
  input: { projectSlug: string; slug: string },
) {
  await endpointAuth.admin(headers)

  const subsection = await db.subsection.findFirst({
    where: { slug: input.slug, project: { slug: input.projectSlug } },
    select: { id: true, projectId: true },
  })

  if (subsection) {
    const draft = await db.mcpDraft.findUnique({
      where: { subsectionId: subsection.id },
      select: {
        id: true,
        updatedAt: true,
        patch: true,
        createdBy: { select: draftAuthorSelect },
      },
    })
    if (!draft) return null
    const overlay = await overlayFromSubsectionDraft({
      patch: draft.patch,
      projectId: subsection.projectId,
      createDraft: false,
    })
    return {
      id: draft.id,
      kind: "update" as const,
      updatedAt: draft.updatedAt,
      createdBy: draft.createdBy,
      slug: input.slug,
      ...overlay,
    } satisfies SubsectionMcpDraftPayload
  }

  const project = await db.project.findUnique({
    where: { slug: input.projectSlug },
    select: { id: true },
  })
  if (!project) return null

  const draft = await db.mcpDraft.findFirst({
    where: { kind: McpDraftKind.SUBSECTION_CREATE, projectId: project.id, slug: input.slug },
    select: {
      id: true,
      updatedAt: true,
      patch: true,
      slug: true,
      createdBy: { select: draftAuthorSelect },
    },
  })
  if (!draft) return null

  const overlay = await overlayFromSubsectionDraft({
    patch: draft.patch,
    projectId: project.id,
    createDraft: true,
  })
  return {
    id: draft.id,
    kind: "create" as const,
    updatedAt: draft.updatedAt,
    createdBy: draft.createdBy,
    slug: draft.slug ?? input.slug,
    ...overlay,
    formOverlay: { slug: draft.slug ?? input.slug, ...overlay.formOverlay },
  } satisfies SubsectionMcpDraftPayload
}

export async function deleteSubsubsectionMcpCreateDraftBySlug(
  parentSubsectionId: number,
  slug: string,
) {
  return db.mcpDraft.deleteMany({
    where: { kind: McpDraftKind.SUBSUBSECTION_CREATE, parentSubsectionId, slug },
  })
}

export async function deleteSubsectionMcpCreateDraftBySlug(projectId: number, slug: string) {
  return db.mcpDraft.deleteMany({
    where: { kind: McpDraftKind.SUBSECTION_CREATE, projectId, slug },
  })
}

export async function deleteMcpDraft(
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
    where: { kind: McpDraftKind.SUBSUBSECTION_CREATE, parentSubsectionId: subsection.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      updatedAt: true,
      createdBy: { select: draftAuthorSelect },
    },
  })

  return { drafts }
}

export async function listProjectSubsectionMcpCreateDrafts(
  headers: Headers,
  input: { projectSlug: string },
) {
  await endpointAuth.admin(headers)

  const drafts = await db.mcpDraft.findMany({
    where: { kind: McpDraftKind.SUBSECTION_CREATE, project: { slug: input.projectSlug } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      updatedAt: true,
      createdBy: { select: draftAuthorSelect },
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
      kind: true,
      updatedAt: true,
      slug: true,
      createdBy: { select: draftAuthorSelect },
      project: { select: { slug: true, subTitle: true } },
      parentSubsection: { select: { slug: true } },
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
      kind: McpDraftKind
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

    const subsectionSlug =
      draft.subsubsection?.subsection.slug ??
      draft.parentSubsection?.slug ??
      draft.subsection?.slug ??
      (draft.kind === McpDraftKind.SUBSECTION_CREATE ? draft.slug : null)

    const subsubsectionSlug =
      draft.kind === McpDraftKind.SUBSUBSECTION_UPDATE ||
      draft.kind === McpDraftKind.SUBSUBSECTION_CREATE
        ? (draft.subsubsection?.slug ?? draft.slug ?? null)
        : null

    groups[groupIndex]!.drafts.push({
      id: draft.id,
      updatedAt: draft.updatedAt,
      createdBy: draft.createdBy,
      kind: draft.kind,
      subsectionSlug,
      subsubsectionSlug,
    })
  }

  return { groups, total: drafts.length }
}
