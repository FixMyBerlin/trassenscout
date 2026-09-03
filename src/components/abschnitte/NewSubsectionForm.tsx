import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { SubsectionForm } from "@/src/components/abschnitte/SubsectionForm"
import { SubsectionMcpDraftAdminBox } from "@/src/components/abschnitte/SubsectionMcpDraftAdminBox"
import {
  SubsectionMcpDraftApplyGate,
  subsectionMcpDraftApplyState,
} from "@/src/components/abschnitte/SubsectionMcpDraftApplyGate"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { deleteMcpDraftFn } from "@/src/server/mcp/mcpDrafts/mcpDrafts.functions"
import {
  invalidateMcpDraftQueries,
  subsectionMcpDraftQueryOptions,
} from "@/src/server/mcp/mcpDrafts/mcpDraftsQueryOptions"
import { subsectionMaxOrderQueryOptions } from "@/src/server/subsections/subsectionMaxOrderQueryOptions"
import { createSubsectionFn } from "@/src/server/subsections/subsections.functions"
import { geometryTypeValidationRefine } from "@/src/shared/geometry/geometryTypeValidation"
import { SubsectionBaseSchema } from "@/src/shared/subsections/schemas"
import { isSubsectionMcpDraftSearch } from "@/src/shared/subsections/searchSchemas"

const newSubsectionRouteApi = getRouteApi("/_loggedInProjects/$projectSlug/abschnitte/new/")

const NewSubsectionSchema = geometryTypeValidationRefine(
  SubsectionBaseSchema.omit({ projectId: true }),
)

type Props = {
  projectSlug: string
}

export const NewSubsectionForm = ({ projectSlug }: Props) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: maxOrder } = useSuspenseQuery(subsectionMaxOrderQueryOptions(projectSlug))
  const createSubsectionMutation = useMutation({ mutationFn: createSubsectionFn })
  const deleteMcpDraftMutation = useMutation({ mutationFn: deleteMcpDraftFn })
  const { mcpDraft: mcpDraftSearch, slug: slugSearch } = newSubsectionRouteApi.useSearch()
  const applyMcpDraft = isSubsectionMcpDraftSearch(mcpDraftSearch) && Boolean(slugSearch)
  const mcpDraftQuery = useQuery({
    ...subsectionMcpDraftQueryOptions({ projectSlug, slug: slugSearch ?? "" }),
    enabled: applyMcpDraft,
  })
  const mcpDraft = mcpDraftQuery.data

  type HandleSubmit = z.infer<typeof NewSubsectionSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const subsection = await createSubsectionMutation.mutateAsync({
        data: { ...values, projectSlug },
      })
      if (applyMcpDraft && mcpDraft) {
        await deleteMcpDraftMutation.mutateAsync({
          data: { projectSlug, id: mcpDraft.id },
        })
        await invalidateMcpDraftQueries(queryClient)
      }
      void navigate({
        to: "/$projectSlug/abschnitte/$subsectionSlug",
        params: { projectSlug, subsectionSlug: subsection.slug },
      })
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["order", "slug"])
    }
  }

  const overlay = applyMcpDraft ? (mcpDraft?.formOverlay ?? {}) : {}
  const applyState = subsectionMcpDraftApplyState(applyMcpDraft, mcpDraftQuery)

  return (
    <SubsectionMcpDraftApplyGate state={applyState}>
      {applyMcpDraft && slugSearch ? (
        <SubsectionMcpDraftAdminBox
          projectSlug={projectSlug}
          slug={slugSearch}
          overlayApplied
          createDraft
        />
      ) : null}
      {applyMcpDraft && mcpDraft?.overlayErrors.length ? (
        <p className="mb-4 text-sm text-amber-800">
          Einige MCP-Felder konnten nicht ins Formular übernommen werden:{" "}
          {mcpDraft.overlayErrors.join(" ")}
        </p>
      ) : null}
      <SubsectionForm
        key={applyMcpDraft ? `mcp-create-${mcpDraft?.id ?? "pending"}` : "new"}
        initialValues={
          {
            labelPos: "bottom",
            order: (maxOrder ?? 0) + 1,
            slug: slugSearch ?? "",
            ...overlay,
          } as unknown as z.infer<typeof NewSubsectionSchema>
        }
        submitText="Erstellen"
        backLink={
          <BackLink to="/$projectSlug" params={{ projectSlug }} text="Zurück zum Projekt" />
        }
        schema={NewSubsectionSchema}
        onSubmit={handleSubmit}
      />
    </SubsectionMcpDraftApplyGate>
  )
}
