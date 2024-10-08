"use client"
import { ProjectForm } from "@/src/app/(loggedin)/[projectSlug]/edit/_components/ProjectForm"
import { FORM_ERROR } from "@/src/core/components/forms"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createMembership from "@/src/server/memberships/mutations/createMembership"
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
  const [createMembershipMutation] = useMutation(createMembership)

  const [{ users }] = useQuery(getUsers, {})
  // If we where to pick ourselves, we would create a membership which in turn would delete our session to update it which  would cause weird redirect issues.
  const usersExceptSelf = users.filter((user) => user.id !== currentUser?.id)

  const handleSubmit = async (values: ProjectFormType) => {
    const partnerLogoSrcsArray = values.partnerLogoSrcs?.split("\n")
    const input: ProjectType = { ...values, partnerLogoSrcs: partnerLogoSrcsArray }
    try {
      const project = await createProjectMutation(input)

      if (project.managerId) {
        try {
          await createMembershipMutation({
            projectId: project.id,
            userId: project.managerId,
            role: "EDITOR",
          })
        } catch (error: any) {
          console.error(error)
          return { [FORM_ERROR]: error }
        }
      }

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
      users={usersExceptSelf}
    />
  )
}
