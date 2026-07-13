import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { SubsectionForm } from "@/src/components/abschnitte/SubsectionForm"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { subsectionMaxOrderQueryOptions } from "@/src/server/subsections/subsectionMaxOrderQueryOptions"
import { createSubsectionFn } from "@/src/server/subsections/subsections.functions"
import { geometryTypeValidationRefine } from "@/src/shared/geometry/geometryTypeValidation"
import { SubsectionBaseSchema } from "@/src/shared/subsections/schemas"

const NewSubsectionSchema = geometryTypeValidationRefine(
  SubsectionBaseSchema.omit({ projectId: true }),
)

type Props = {
  projectSlug: string
}

export const NewSubsectionForm = ({ projectSlug }: Props) => {
  const navigate = useNavigate()
  const { data: maxOrder } = useSuspenseQuery(subsectionMaxOrderQueryOptions(projectSlug))
  const createSubsectionMutation = useMutation({ mutationFn: createSubsectionFn })

  type HandleSubmit = z.infer<typeof NewSubsectionSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const subsection = await createSubsectionMutation.mutateAsync({
        data: { ...values, projectSlug },
      })
      void navigate({
        to: "/$projectSlug/abschnitte/$subsectionSlug",
        params: { projectSlug, subsectionSlug: subsection.slug },
      })
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["order", "slug"])
    }
  }

  return (
    <SubsectionForm
      initialValues={{
        labelPos: "bottom",
        order: (maxOrder ?? 0) + 1,
      }}
      submitText="Erstellen"
      schema={NewSubsectionSchema}
      onSubmit={handleSubmit}
    />
  )
}
