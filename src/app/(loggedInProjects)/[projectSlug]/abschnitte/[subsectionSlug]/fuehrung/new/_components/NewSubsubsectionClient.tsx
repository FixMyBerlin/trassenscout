"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { subsubsectionDashboardRoute } from "@/src/core/routes/subsectionRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import createSubsubsection from "@/src/server/subsubsections/mutations/createSubsubsection"
import { SubsubsectionBaseSchema } from "@/src/server/subsubsections/schema"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { LocationEnum } from "@prisma/client"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { SubsubsectionForm } from "../../_components/SubsubsectionForm"
import { SubsubsectionSchemaAdminBox } from "../../_components/SubsubsectionSchemaAdminBox"

const NewSubsubsectionSchema = SubsubsectionBaseSchema.omit({
  subsectionId: true,
  location: true,
}).extend({
  location: z.union([z.nativeEnum(LocationEnum), z.literal("")]),
})

type Props = {
  initialSubsection: Awaited<ReturnType<typeof getSubsection>>
}

export const NewSubsubsectionClient = ({ initialSubsection }: Props) => {
  const router = useRouter()
  const [createSubsubsectionMutation] = useMutation(createSubsubsection)

  const subsectionSlug = useSlug("subsectionSlug")
  const projectSlug = useProjectSlug()
  const [subsection] = useQuery(
    getSubsection,
    {
      projectSlug,
      subsectionSlug: subsectionSlug!,
    },
    {
      initialData: initialSubsection,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  type HandleSubmit = z.infer<typeof NewSubsubsectionSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const mutationPayload = {
        ...values,
        projectSlug,
        subsectionId: subsection!.id,
        location: values.location === "" ? null : values.location,
        trafficLoadDate: values.trafficLoadDate ? new Date(values.trafficLoadDate) : null,
        estimatedCompletionDate: values.estimatedCompletionDate
          ? new Date(values.estimatedCompletionDate)
          : null,
      }
      const subsubsection = await createSubsubsectionMutation(mutationPayload)

      await router.push(
        subsubsectionDashboardRoute(projectSlug, subsectionSlug!, subsubsection.slug),
      )
    } catch (error: any) {
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
      />

      <SubsubsectionSchemaAdminBox className="mt-8" projectSlug={projectSlug} />
    </>
  )
}
