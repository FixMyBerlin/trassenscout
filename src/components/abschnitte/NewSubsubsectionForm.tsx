import { useMutation } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { SubsubsectionForm } from "@/src/components/abschnitte/SubsubsectionForm"
import { SubsubsectionSchemaAdminBox } from "@/src/components/abschnitte/SubsubsectionSchemaAdminBox"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { LocationEnum } from "@/src/prisma/generated/browser"
import type { SubsectionBySlug } from "@/src/server/subsections/types"
import { createSubsubsectionFn } from "@/src/server/subsubsections/subsubsections.functions"
import { SubsubsectionBaseSchema } from "@/src/shared/subsubsections/schemas"

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
  const createSubsubsectionMutation = useMutation({ mutationFn: createSubsubsectionFn })
  const { projectSlug, subsectionSlug } = fuehrungNewRouteApi.useParams()

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

  return (
    <>
      <SubsubsectionForm
        initialValues={{ type: "LINE", labelPos: "bottom", location: "" }}
        className="mt-10"
        submitText="Erstellen"
        schema={NewSubsubsectionSchema}
        onSubmit={handleSubmit}
        subsectionSlug={subsectionSlug}
      />
      <SubsubsectionSchemaAdminBox className="mt-8" projectSlug={projectSlug} />
    </>
  )
}
