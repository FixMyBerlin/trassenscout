"use client"
import { MembershipForm } from "@/src/app/(admin)/admin/memberships/new/_components/MembershipForm"
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
      router.refresh()
    } catch (error: any) {
      console.error(error)
      return { success: false, message: error instanceof Error ? error.message : String(error) }
    }
  }

  return (
    <MembershipForm
      initialValues={{
        userId: userIdParam ? Number(userIdParam) : 0,
        role: "EDITOR",
        projectId: 0,
      }}
      schema={MembershipSchema}
      submitText="Erstellen"
      onSubmit={handleSubmit}
    />
  )
}
