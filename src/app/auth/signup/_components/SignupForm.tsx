"use client"
import { DevAdminBox } from "@/src/core/components/AdminBox/DevAdminBox"
import { FORM_ERROR, Form } from "@/src/core/components/forms/Form"
import { HiddenField } from "@/src/core/components/forms/HiddenField"
import { LabeledTextField } from "@/src/core/components/forms/LabeledTextField"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import signup from "@/src/server/auth/mutations/signup"
import { SignupSchema } from "@/src/server/auth/schema"
import getInvite from "@/src/server/invites/queries/getInvite"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter, useSearchParams } from "next/navigation"

export const SignupForm = () => {
  const router = useRouter()
  const [signupMutation] = useMutation(signup)

  const paramInviteToken = useSearchParams()?.get("inviteToken") || null
  const [invite] = useQuery(getInvite, { token: paramInviteToken })

  type HandleSubmit = {
    email: string
    firstName: string
    lastName: string
    institution: string | null
    phone: string | null
    password: string
    inviteToken: string | null
  }
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await signupMutation(values)
      router.push("/")
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["email"])
    }
  }

  return (
    <>
      <Form
        submitText="Registrieren"
        schema={SignupSchema}
        initialValues={{
          email: invite?.email || "",
          password: "",
          inviteToken: invite?.token || null,
        }}
        onSubmit={handleSubmit}
      >
        <HiddenField name="inviteToken" />
        <LabeledTextField
          type="email"
          name="email"
          label={Boolean(invite?.email) ? "E-Mail-Adresse der Einladung" : "E-Mail-Adresse"}
          placeholder="name@beispiel.de"
          autoComplete="email"
          readOnly={Boolean(invite?.email)}
        />
        <LabeledTextField
          name="firstName"
          label="Vorname"
          placeholder=""
          autoComplete="given-name"
        />
        <LabeledTextField
          name="lastName"
          label="Nachname"
          placeholder=""
          autoComplete="family-name"
        />
        <LabeledTextField
          name="institution"
          label="Organisation / Kommune"
          placeholder=""
          optional
        />
        <LabeledTextField
          type="tel"
          name="phone"
          label="Telefon"
          placeholder=""
          autoComplete="tel"
          optional
        />
        <LabeledTextField
          name="password"
          label="Passwort"
          placeholder=""
          type="password"
          autoComplete="current-password"
        />
      </Form>

      <DevAdminBox className="text-center">
        <p className="text-sm">
          Invitation Token: {paramInviteToken || "NOT FOUND"}
          <br />
          Invite: {invite ? "FOUND" : "NOT FOUND"}
        </p>
      </DevAdminBox>

      <div className="mt-4">
        Sie haben bereits einen Account? Zur{" "}
        <Link
          href={{
            pathname: "/auth/login",
            query: { inviteToken: paramInviteToken },
          }}
        >
          Anmeldung
        </Link>
        .
      </div>
    </>
  )
}
