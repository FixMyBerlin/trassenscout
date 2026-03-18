"use client"
import { ProjectForm } from "@/src/app/(loggedInProjects)/[projectSlug]/edit/_components/ProjectForm"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createProject from "@/src/server/projects/mutations/createProject"
import { ProjectFormSchema, ProjectFormType, ProjectType } from "@/src/server/projects/schema"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"

export const AdminProjectsNewForm = () => {
  const router = useRouter()
  const [createProjectMutation] = useMutation(createProject)

  const handleSubmit = async (values: ProjectFormType) => {
    const partnerLogoSrcsArray = values.partnerLogoSrcs?.split("\n")
    const input: ProjectType = { ...values, partnerLogoSrcs: partnerLogoSrcsArray }
    try {
      await createProjectMutation(input)
      router.push("/dashboard")
    } catch (error: any) {
      return improveErrorMessage(error, ["slug"])
    }
  }

  return <ProjectForm submitText="Erstellen" onSubmit={handleSubmit} schema={ProjectFormSchema} />
}
