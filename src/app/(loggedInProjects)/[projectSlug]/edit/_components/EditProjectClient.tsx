"use client"

import { ProjectForm } from "@/src/app/(loggedInProjects)/[projectSlug]/edit/_components/ProjectForm"
import { BackLink } from "@/src/core/components/forms/BackLink"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { projectDashboardRoute } from "@/src/core/routes/projectRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import updateProject from "@/src/server/projects/mutations/updateProject"
import getProject from "@/src/server/projects/queries/getProject"
import { ProjectFormSchema } from "@/src/server/projects/schema"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { z } from "zod"

type Props = {
  initialProject: Awaited<ReturnType<typeof getProject>>
  initialUsers: Awaited<ReturnType<typeof getProjectUsers>>
}

export const EditProjectClient = ({ initialProject, initialUsers }: Props) => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [project, { setQueryData }] = useQuery(
    getProject,
    { projectSlug },
    {
      initialData: initialProject,
      staleTime: Infinity,
    },
  )
  const [updateProjectMutation] = useMutation(updateProject)
  const [users] = useQuery(getProjectUsers, { projectSlug }, { initialData: initialUsers })

  type HandleSubmit = z.infer<typeof ProjectFormSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    const partnerLogoSrcsArray = values.partnerLogoSrcs?.split("\n").filter(Boolean) ?? []

    try {
      const updated = await updateProjectMutation({
        ...values,
        partnerLogoSrcs: partnerLogoSrcsArray,
        projectSlug,
      })
      await setQueryData(updated)
      await router.push(projectDashboardRoute(updated.slug))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <ProjectForm
        className="mt-10"
        submitText="Speichern"
        schema={ProjectFormSchema}
        initialValues={{ ...project, partnerLogoSrcs: project.partnerLogoSrcs.join("\n") }}
        onSubmit={handleSubmit}
        users={users}
      />

      <BackLink href={projectDashboardRoute(projectSlug)} text="Zurück zum Projekt" />
    </>
  )
}
