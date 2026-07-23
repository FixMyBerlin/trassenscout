import { useMutation } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import type { ProjectUsersList } from "@/src/server/memberships/types"
import { updateProjectFn } from "@/src/server/projects/projects.functions"
import type { ProjectBySlug } from "@/src/server/projects/types"
import { ProjectFormSchema } from "@/src/shared/projects/schemas"
import { ProjectForm } from "./ProjectForm"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

type Props = {
  initialProject: ProjectBySlug
  initialUsers: ProjectUsersList
}

export const EditProjectClient = ({ initialProject, initialUsers }: Props) => {
  const navigate = useNavigate()
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const updateProjectMutation = useMutation({ mutationFn: updateProjectFn })

  type HandleSubmit = z.infer<typeof ProjectFormSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    const partnerLogoSrcsArray = values.partnerLogoSrcs?.split("\n").filter(Boolean) ?? []

    try {
      const updated = await updateProjectMutation.mutateAsync({
        data: {
          ...values,
          partnerLogoSrcs: partnerLogoSrcsArray,
          projectSlug,
        },
      })
      void navigate({ to: "/$projectSlug", params: { projectSlug: updated.slug } })
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <ProjectForm
        submitText="Speichern"
        schema={ProjectFormSchema}
        initialValues={{
          ...initialProject,
          partnerLogoSrcs: initialProject.partnerLogoSrcs?.join("\n") ?? "",
        }}
        onSubmit={handleSubmit}
        users={initialUsers}
      />

      <BackLink to="/$projectSlug" params={{ projectSlug }} text="Zurück zum Projekt" />
    </>
  )
}
