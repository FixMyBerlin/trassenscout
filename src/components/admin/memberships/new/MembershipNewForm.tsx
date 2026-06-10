import { useMutation } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { MembershipForm } from "@/src/components/admin/memberships/new/MembershipForm"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { createMembershipFn } from "@/src/server/memberships/memberships.functions"
import { MembershipSchema } from "@/src/shared/memberships/schemas"

const routeApi = getRouteApi("/admin/memberships/new/")

export const MembershipNewForm = () => {
  const navigate = useNavigate()
  const { userId: userIdParam } = routeApi.useSearch()
  const createMembershipMutation = useMutation({ mutationFn: createMembershipFn })

  type HandleSubmit = z.infer<typeof MembershipSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createMembershipMutation.mutateAsync({ data: values })
      navigate({ to: "/admin/memberships" })
    } catch (error: unknown) {
      console.error(error)
      return { [FORM_ERROR]: error instanceof Error ? error.message : String(error) }
    }
  }

  return (
    <MembershipForm
      initialValues={{ userId: userIdParam ? Number(userIdParam) : undefined }}
      schema={MembershipSchema}
      submitText="Erstellen"
      onSubmit={handleSubmit}
    />
  )
}
