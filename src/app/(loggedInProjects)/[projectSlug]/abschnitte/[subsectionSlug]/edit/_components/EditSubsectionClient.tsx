"use client"

import { BackLink } from "@/src/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { shortTitle } from "@/src/core/components/text"
import { projectDashboardRoute } from "@/src/core/routes/projectRoutes"
import { subsectionDashboardRoute } from "@/src/core/routes/subsectionRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { useSlug } from "@/src/core/routes/useSlug"
import getProject from "@/src/server/projects/queries/getProject"
import deleteSubsection from "@/src/server/subsections/mutations/deleteSubsection"
import updateSubsection from "@/src/server/subsections/mutations/updateSubsection"
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import { SubsectionSchema } from "@/src/server/subsections/schema"
import { invalidateQuery, useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { SubsectionForm } from "../../../_components/SubsectionForm"

type Props = {
  initialSubsection: Awaited<ReturnType<typeof getSubsection>>
  initialProject: Awaited<ReturnType<typeof getProject>>
}

export const EditSubsectionClient = ({ initialSubsection, initialProject }: Props) => {
  const router = useRouter()
  const subsectionSlug = useSlug("subsectionSlug")
  const projectSlug = useProjectSlug()
  const [project] = useQuery(getProject, { projectSlug }, { initialData: initialProject })
  const [subsection, { setQueryData }] = useQuery(
    getSubsection,
    { projectSlug, subsectionSlug: subsectionSlug! },
    { initialData: initialSubsection, staleTime: Infinity },
  )
  const [updateSubsectionMutation] = useMutation(updateSubsection)

  type HandleSubmit = z.infer<typeof SubsectionSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSubsectionMutation({
        ...values,
        id: subsection.id,
        projectSlug,
      })
      await setQueryData(updated)
      // Invalidate queries so the overview page shows fresh data
      await invalidateQuery(getSubsection)
      await invalidateQuery(getSubsections)
      await router.push(subsectionDashboardRoute(projectSlug, updated.slug))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["order", "slug"])
    }
  }

  const [deleteSubsectionMutation] = useMutation(deleteSubsection)

  const showPath = subsectionDashboardRoute(projectSlug, subsection.slug)
  const indexPath = projectDashboardRoute(projectSlug)

  return (
    <>
      <SubsectionForm
        className="mt-10"
        submitText="Speichern"
        schema={SubsectionSchema}
        initialValues={{
          ...subsection,
        }}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={shortTitle(subsection.slug)}
            onDelete={() => deleteSubsectionMutation({ projectSlug, id: subsection.id })}
            returnPath={indexPath}
          />
        }
      />

      <BackLink href={showPath} text="Zurück zum Planungsabschnitt" />
    </>
  )
}
