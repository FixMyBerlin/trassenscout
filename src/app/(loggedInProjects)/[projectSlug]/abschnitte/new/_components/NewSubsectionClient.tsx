"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { subsectionDashboardRoute } from "@/src/core/routes/subsectionRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { geometryTypeValidationRefine } from "@/src/server/shared/utils/geometryTypeValidation"
import createSubsection from "@/src/server/subsections/mutations/createSubsection"
import getSubsectionMaxOrder from "@/src/server/subsections/queries/getSubsectionMaxOrder"
import { SubsectionBaseSchema } from "@/src/server/subsections/schema"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { SubsectionForm } from "../../_components/SubsectionForm"

const NewSubsectionSchema = geometryTypeValidationRefine(
  SubsectionBaseSchema.omit({ projectId: true }),
)

type Props = {
  initialMaxOrder: Awaited<ReturnType<typeof getSubsectionMaxOrder>>
  projectId: number
}

export const NewSubsectionClient = ({ initialMaxOrder, projectId }: Props) => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [createSubsectionMutation] = useMutation(createSubsection)
  const [maxOrderSubsections] = useQuery(getSubsectionMaxOrder, projectId, {
    initialData: initialMaxOrder,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  type HandleSubmit = z.infer<typeof NewSubsectionSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const subsection = await createSubsectionMutation({
        ...values,
        projectId,
        projectSlug,
      })
      await router.push(subsectionDashboardRoute(projectSlug, subsection.slug))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["order", "slug"])
    }
  }

  return (
    <>
      <SubsectionForm
        initialValues={{
          labelPos: "bottom",
          order: (maxOrderSubsections || 0) + 1,
        }}
        submitText="Erstellen"
        schema={NewSubsectionSchema}
        onSubmit={handleSubmit}
      />
    </>
  )
}
