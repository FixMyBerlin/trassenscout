import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import type { z } from "zod"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { ProjectForm } from "@/src/components/projects/ProjectForm"
import { createProjectFn } from "@/src/server/projects/projects.functions"
import { usersAdminQueryOptions } from "@/src/server/users/usersQueryOptions"
import {
  ProjectFormSchema,
  type ProjectFormType,
  ProjectSchema,
} from "@/src/shared/projects/schemas"

export const AdminProjectsNewForm = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: usersResult } = useSuspenseQuery(usersAdminQueryOptions())
  const createProjectMutation = useMutation({ mutationFn: createProjectFn })

  const handleSubmit = async (values: ProjectFormType) => {
    const partnerLogoSrcsArray = values.partnerLogoSrcs?.split("\n")
    const input: z.infer<typeof ProjectSchema> = {
      ...values,
      partnerLogoSrcs: partnerLogoSrcsArray,
    }
    try {
      const project = await createProjectMutation.mutateAsync({ data: input })
      queryClient.removeQueries({ queryKey: ["projects"] })
      navigate({ to: "/$projectSlug", params: { projectSlug: project.slug } })
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <ProjectForm
      submitText="Erstellen"
      backLink={null}
      onSubmit={handleSubmit}
      schema={ProjectFormSchema}
      users={usersResult.users}
    />
  )
}
