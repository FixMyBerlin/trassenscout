import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useRouter } from "@tanstack/react-router"
import { z } from "zod"
import { SubsectionForm } from "@/src/components/abschnitte/SubsectionForm"
import {
  SubsectionMcpDraftApplyGate,
  subsectionMcpDraftApplyState,
} from "@/src/components/abschnitte/SubsectionMcpDraftApplyGate"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { deleteMcpDraftFn } from "@/src/server/mcp/mcpDrafts/mcpDrafts.functions"
import {
  invalidateMcpDraftQueries,
  subsectionMcpDraftQueryOptions,
} from "@/src/server/mcp/mcpDrafts/mcpDraftsQueryOptions"
import {
  deleteSubsectionFn,
  updateSubsectionFn,
} from "@/src/server/subsections/subsections.functions"
import type { SubsectionBySlug } from "@/src/server/subsections/types"
import { SubsectionSchema } from "@/src/shared/subsections/schemas"

type Props = {
  subsection: SubsectionBySlug
  projectSlug: string
  applyMcpDraft?: boolean
}

export const EditSubsectionForm = ({ subsection, projectSlug, applyMcpDraft = false }: Props) => {
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const updateSubsectionMutation = useMutation({ mutationFn: updateSubsectionFn })
  const deleteSubsectionMutation = useMutation({ mutationFn: deleteSubsectionFn })
  const deleteMcpDraftMutation = useMutation({ mutationFn: deleteMcpDraftFn })
  const mcpDraftQuery = useQuery({
    ...subsectionMcpDraftQueryOptions({ projectSlug, slug: subsection.slug }),
    enabled: applyMcpDraft,
  })
  const mcpDraft = mcpDraftQuery.data

  const indexPath = router.buildLocation({
    to: "/$projectSlug",
    params: { projectSlug },
  }).href

  type HandleSubmit = z.infer<typeof SubsectionSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSubsectionMutation.mutateAsync({
        data: { ...values, id: subsection.id, projectSlug },
      })
      if (applyMcpDraft && mcpDraft) {
        await deleteMcpDraftMutation.mutateAsync({
          data: { projectSlug, id: mcpDraft.id },
        })
        await invalidateMcpDraftQueries(queryClient)
      }
      void navigate({
        to: "/$projectSlug/abschnitte/$subsectionSlug",
        params: { projectSlug, subsectionSlug: updated.slug },
      })
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["order", "slug"])
    }
  }

  const overlay = applyMcpDraft ? (mcpDraft?.formOverlay ?? {}) : {}
  const applyState = subsectionMcpDraftApplyState(applyMcpDraft, mcpDraftQuery)

  return (
    <SubsectionMcpDraftApplyGate state={applyState}>
      {applyMcpDraft && mcpDraft?.overlayErrors.length ? (
        <p className="mb-4 text-sm text-amber-800">
          Einige MCP-Felder konnten nicht ins Formular übernommen werden:{" "}
          {mcpDraft.overlayErrors.join(" ")}
        </p>
      ) : null}
      <SubsectionForm
        key={applyMcpDraft ? `mcp-draft-${mcpDraft?.id ?? "pending"}` : "current"}
        submitText="Speichern"
        schema={SubsectionSchema}
        initialValues={{ ...subsection, ...overlay } as unknown as z.infer<typeof SubsectionSchema>}
        subsectionSlug={subsection.slug}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={shortTitle(subsection.slug)}
            onDelete={() =>
              deleteSubsectionMutation.mutateAsync({ data: { projectSlug, id: subsection.id } })
            }
            returnPath={indexPath}
          />
        }
        backLink={
          <BackLink
            to="/$projectSlug/abschnitte/$subsectionSlug"
            params={{ projectSlug, subsectionSlug: subsection.slug }}
            text="Zurück zum Planungsabschnitt"
          />
        }
      />
    </SubsectionMcpDraftApplyGate>
  )
}
