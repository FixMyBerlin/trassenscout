"use client"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Form } from "@/src/core/components/forms"
import { LabeledTextField } from "@/src/core/components/forms/LabeledTextField"
import updateUser from "@/src/server/auth/mutations/updateUser"
import { UpdateUserSchema, UpdateUserType } from "@/src/server/auth/schema"
import { useCurrentUser } from "@/src/server/users/hooks/useCurrentUser"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"

export const UserEditForm = () => {
  const router = useRouter()

  const user = useCurrentUser()
  const [updateUserMutation] = useMutation(updateUser)
  const handleSubmit = async (values: UpdateUserType) => {
    try {
      await updateUserMutation(values)
      router.push("/dashboard")
    } catch (error: any) {
      console.error(error)
      return { success: false, message: error instanceof Error ? error.message : String(error) }
    }
  }

  if (!user) return null

  return (
    <>
      <Form
        onSubmit={handleSubmit}
        className="max-w-prose"
        submitText="Speichern"
        schema={UpdateUserSchema}
        initialValues={user}
      >
        {(form) => (
          <>
            <LabeledTextField
              form={form}
              name="firstName"
              label="Vorname"
              placeholder=""
              autoComplete="given-name"
            />
            <LabeledTextField
              form={form}
              name="lastName"
              label="Nachname"
              placeholder=""
              autoComplete="family-name"
            />
            <LabeledTextField
              form={form}
              name="institution"
              label="Organisation / Kommune"
              placeholder=""
              optional
            />
            <LabeledTextField
              form={form}
              type="tel"
              name="phone"
              label="Telefon"
              placeholder=""
              autoComplete="tel"
              optional
            />
          </>
        )}
      </Form>
      <SuperAdminLogData data={user} />
    </>
  )
}
