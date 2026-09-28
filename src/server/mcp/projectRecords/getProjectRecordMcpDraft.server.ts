import { z } from "zod"
import { McpDraftKind, ProjectRecordEditingState } from "@/src/prisma/generated/client"
import { endpointAuth } from "@/src/server/auth/endpointAuth.server"
import db from "@/src/server/db.server"

const overlaySchema = z.object({
  title: z.string().min(1).optional(),
  editingState: z.enum(ProjectRecordEditingState).optional(),
  body: z.string().optional(),
  subsectionSlug: z.string().optional(),
  subsubsectionSlug: z.string().optional(),
  assignedToId: z.number().int().optional(),
  tagIds: z.array(z.number().int()).optional(),
})

export async function getProjectRecordMcpDraft(
  headers: Headers,
  input: { projectSlug: string; id?: number; ref?: string },
) {
  await endpointAuth.admin(headers)
  const project = await db.project.findUnique({
    where: { slug: input.projectSlug },
    select: { id: true },
  })
  if (!project) return null

  const draft =
    input.id != null
      ? await db.mcpDraft.findFirst({
          where: {
            projectId: project.id,
            kind: McpDraftKind.PROJECT_RECORD_UPDATE,
            projectRecordId: input.id,
          },
          select: { id: true, patch: true, slug: true },
        })
      : input.ref
        ? await db.mcpDraft.findFirst({
            where: {
              projectId: project.id,
              kind: McpDraftKind.PROJECT_RECORD_CREATE,
              slug: input.ref,
            },
            select: { id: true, patch: true, slug: true },
          })
        : null
  if (!draft) return null

  const parsed = overlaySchema.safeParse(draft.patch)
  const data = parsed.success ? parsed.data : {}
  let subsubsectionId: number | undefined
  if (data.subsectionSlug && data.subsubsectionSlug) {
    const row = await db.subsubsection.findFirst({
      where: {
        slug: data.subsubsectionSlug,
        subsection: { slug: data.subsectionSlug, projectId: project.id },
      },
      select: { id: true },
    })
    subsubsectionId = row?.id
  }

  return {
    id: draft.id,
    kind: input.id != null ? ("update" as const) : ("create" as const),
    formOverlay: {
      title: data.title,
      editingState: data.editingState,
      body: data.body,
      subsubsectionId,
      ...(data.assignedToId != null ? { assignedToId: data.assignedToId } : {}),
      ...(data.tagIds ? { tags: data.tagIds.map(String) } : {}),
    },
  }
}
