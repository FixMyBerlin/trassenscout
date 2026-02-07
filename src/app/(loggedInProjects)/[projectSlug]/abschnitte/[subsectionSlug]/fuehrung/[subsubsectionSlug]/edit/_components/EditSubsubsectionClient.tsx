"use client"

import { getDate } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_utils/splitStartAt"
import { BackLink } from "@/src/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { shortTitle } from "@/src/core/components/text"
import {
  subsectionDashboardRoute,
  subsubsectionDashboardRoute,
} from "@/src/core/routes/subsectionRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import { M2MFieldsType, m2mFields } from "@/src/server/subsubsections/m2mFields"
import deleteSubsubsection from "@/src/server/subsubsections/mutations/deleteSubsubsection"
import updateSubsubsection from "@/src/server/subsubsections/mutations/updateSubsubsection"
import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import { SubsubsectionFormSchema } from "@/src/server/subsubsections/schema"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { SubsubsectionForm } from "../../../_components/SubsubsectionForm"

type Props = {
  initialSubsubsection: Awaited<ReturnType<typeof getSubsubsection>>
}

export const EditSubsubsectionClient = ({ initialSubsubsection }: Props) => {
  const router = useRouter()
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const projectSlug = useProjectSlug()
  const [subsubsection] = useQuery(
    getSubsubsection,
    {
      projectSlug,
      subsectionSlug: subsectionSlug!,
      subsubsectionSlug: subsubsectionSlug!,
    },
    {
      initialData: initialSubsubsection,
      staleTime: Infinity,
    },
  )
  const [updateSubsubsectionMutation] = useMutation(updateSubsubsection)

  type HandleSubmit = z.infer<typeof SubsubsectionFormSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSubsubsectionMutation({
        ...values,
        id: subsubsection.id,
        projectSlug,
        location: values.location === "" ? null : values.location,
        trafficLoadDate: values.trafficLoadDate === "" ? null : new Date(values.trafficLoadDate),
        estimatedCompletionDate:
          values.estimatedCompletionDate === "" ? null : new Date(values.estimatedCompletionDate),
      })
      await router.push(subsubsectionDashboardRoute(projectSlug, subsectionSlug!, updated.slug))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  const [deleteSubsectionMutation] = useMutation(deleteSubsubsection)

  const showPath = subsubsectionDashboardRoute(projectSlug, subsectionSlug!, subsubsection.slug)
  const indexPath = subsectionDashboardRoute(projectSlug, subsectionSlug!)

  const m2mFieldsInitialValues: Record<M2MFieldsType | string, string[]> = {}
  m2mFields.forEach((fieldName) => {
    if (fieldName in subsubsection) {
      m2mFieldsInitialValues[fieldName] = Array.from(
        // @ts-expect-error
        subsubsection[fieldName].values(),
        // @ts-expect-error
        (obj) => String(obj.id),
      )
    }
  })

  return (
    <>
      <SubsubsectionForm
        className="mt-10"
        submitText="Speichern"
        schema={SubsubsectionFormSchema}
        initialValues={
          {
            ...subsubsection,
            ...m2mFieldsInitialValues,
            location: subsubsection.location || "",
            trafficLoadDate: subsubsection.trafficLoadDate
              ? getDate(subsubsection.trafficLoadDate)
              : "",
            estimatedCompletionDate: subsubsection.estimatedCompletionDate
              ? getDate(subsubsection.estimatedCompletionDate)
              : "",
          } as any
        }
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={shortTitle(subsubsection.slug)}
            onDelete={() => deleteSubsectionMutation({ projectSlug, id: subsubsection.id })}
            returnPath={indexPath}
          />
        }
      />

      <BackLink href={showPath} text="Zurück zum Eintrag" />
    </>
  )
}
