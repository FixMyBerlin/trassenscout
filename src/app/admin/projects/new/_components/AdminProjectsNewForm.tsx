"use client"
import { ProjectForm } from "@/src/app/(loggedin)/[projectSlug]/edit/_components/ProjectForm"
import { FORM_ERROR } from "@/src/core/components/forms"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createProject from "@/src/server/projects/mutations/createProject"
import { ProjectFormSchema, ProjectFormType, ProjectType } from "@/src/server/projects/schema"
import { useCurrentUser } from "@/src/server/users/hooks/useCurrentUser"
import getUsers from "@/src/server/users/queries/getUsers"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"

export const AdminProjectsNewForm = () => {
  const router = useRouter()
  const currentUser = useCurrentUser()
  const [createProjectMutation] = useMutation(createProject)
  const [{ users }] = useQuery(getUsers, {})

  const handleSubmit = async (values: ProjectFormType) => {
    const partnerLogoSrcsArray = values.partnerLogoSrcs?.split("\n")
    const input: ProjectType = { ...values, partnerLogoSrcs: partnerLogoSrcsArray }
    try {
      await createProjectMutation(input)
      router.push("/dashboard")
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <ProjectForm
      submitText="Erstellen"
      onSubmit={handleSubmit}
      schema={ProjectFormSchema}
      initialValues={{ managerId: currentUser!.id }}
      users={users}
    />
  )
}
