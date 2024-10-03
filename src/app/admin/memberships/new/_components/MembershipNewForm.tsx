"use client"
import { MembershipForm } from "@/src/app/admin/memberships/new/_components/MembershipForm"
import { FORM_ERROR } from "@/src/core/components/forms"
import createMembership from "@/src/server/memberships/mutations/createMembership"
import { MembershipSchema } from "@/src/server/memberships/schema"
import { useMutation } from "@blitzjs/rpc"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"

export const MembershipNewForm = () => {
  const router = useRouter()
  const userIdParam = useSearchParams()?.get("userId")

  const [createMembershipMutation] = useMutation(createMembership)

  type HandleSubmit = z.infer<typeof MembershipSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createMembershipMutation(values)
      router.push("/admin/memberships")
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
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
