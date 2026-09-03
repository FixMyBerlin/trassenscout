import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { SubsubsectionForm } from "@/src/components/abschnitte/SubsubsectionForm"
import { SubsubsectionMcpDraftAdminBox } from "@/src/components/abschnitte/SubsubsectionMcpDraftAdminBox"
import { SubsubsectionSchemaAdminBox } from "@/src/components/abschnitte/SubsubsectionSchemaAdminBox"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { Spinner } from "@/src/components/core/components/Spinner"
import { LocationEnum } from "@/src/prisma/generated/browser"
import { deleteSubsubsectionMcpDraftFn } from "@/src/server/mcp/mcpDrafts/mcpDrafts.functions"
import {
  invalidateMcpDraftQueries,
  subsubsectionMcpDraftQueryOptions,
} from "@/src/server/mcp/mcpDrafts/mcpDraftsQueryOptions"
import type { SubsectionBySlug } from "@/src/server/subsections/types"
import { createSubsubsectionFn } from "@/src/server/subsubsections/subsubsections.functions"
import { SubsubsectionBaseSchema } from "@/src/shared/subsubsections/schemas"
import { isSubsubsectionMcpDraftSearch } from "@/src/shared/subsubsections/searchSchemas"

const fuehrungNewRouteApi = getRouteApi(
  "/_loggedInProjects/$projectSlug/abschnitte/$subsectionSlug/fuehrung/new/",
)

const NewSubsubsectionSchema = SubsubsectionBaseSchema.omit({
  subsectionId: true,
  location: true,
}).extend({
  location: z.union([z.enum(LocationEnum), z.literal("")]),
})

type Props = {
  subsection: SubsectionBySlug
}

export const NewSubsubsectionForm = ({ subsection }: Props) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createSubsubsectionMutation = useMutation({ mutationFn: createSubsubsectionFn })
  const deleteMcpDraftMutation = useMutation({ mutationFn: deleteSubsubsectionMcpDraftFn })
  const { projectSlug, subsectionSlug } = fuehrungNewRouteApi.useParams()
  const { mcpDraft: mcpDraftSearch, slug: slugSearch } = fuehrungNewRouteApi.useSearch()
  const applyMcpDraft = isSubsubsectionMcpDraftSearch(mcpDraftSearch) && Boolean(slugSearch)
  const mcpDraftQuery = useQuery({
    ...subsubsectionMcpDraftQueryOptions({
      projectSlug,
      subsectionSlug,
      subsubsectionSlug: slugSearch ?? "",
    }),
    enabled: applyMcpDraft,
  })
  const mcpDraft = mcpDraftQuery.data

  type HandleSubmit = z.infer<typeof NewSubsubsectionSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const subsubsection = await createSubsubsectionMutation.mutateAsync({
        data: {
          ...values,
          projectSlug,
          subsectionId: subsection.id,
          location: values.location === "" ? null : values.location,
          trafficLoadDate: values.trafficLoadDate ? new Date(values.trafficLoadDate) : null,
          estimatedCompletionDate: values.estimatedCompletionDate
            ? new Date(values.estimatedCompletionDate)
            : null,
        } as Parameters<typeof createSubsubsectionMutation.mutateAsync>[0]["data"],
      })
      if (applyMcpDraft && mcpDraft) {
        await deleteMcpDraftMutation.mutateAsync({
          data: { projectSlug, id: mcpDraft.id },
        })
        await invalidateMcpDraftQueries(queryClient)
      }
      void navigate({
        to: "/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug",
        params: {
          projectSlug,
          subsectionSlug,
          subsubsectionSlug: subsubsection.slug,
        },
      })
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  const overlay = applyMcpDraft ? (mcpDraft?.formOverlay ?? {}) : {}

  if (applyMcpDraft && mcpDraftQuery.isPending) {
    return <Spinner />
  }

  return (
    <>
      {applyMcpDraft && slugSearch ? (
        <SubsubsectionMcpDraftAdminBox
          projectSlug={projectSlug}
          subsectionSlug={subsectionSlug}
          subsubsectionSlug={slugSearch}
          overlayApplied
          createDraft
        />
      ) : null}
      <SubsubsectionForm
        key={applyMcpDraft ? `mcp-create-${mcpDraft?.id ?? "pending"}` : "new"}
        initialValues={
          {
            type: "LINE",
            labelPos: "bottom",
            location: "",
            isExistingInfra: false,
            slug: slugSearch ?? "",
            ...overlay,
          } as unknown as z.infer<typeof NewSubsubsectionSchema>
        }
        submitText="Erstellen"
        backLink={
          <BackLink
            to="/$projectSlug/abschnitte/$subsectionSlug"
            params={{ projectSlug, subsectionSlug }}
            text="Zurück zum Abschnitt"
          />
        }
        schema={NewSubsubsectionSchema}
        onSubmit={handleSubmit}
        subsectionSlug={subsectionSlug}
      />
      <SubsubsectionSchemaAdminBox className="mt-8" projectSlug={projectSlug} />
    </>
  )
}
