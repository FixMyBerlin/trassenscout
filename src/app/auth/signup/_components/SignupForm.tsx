"use client"

import { DevAdminBox } from "@/src/core/components/AdminBox/DevAdminBox"
import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import {
  applyFormSubmitResult,
  FORM_ERROR,
} from "@/src/core/components/forms/utils/formSubmitResult"
import { Link } from "@/src/core/components/links"
import signup from "@/src/server/auth/mutations/signup"
import { signupFormDefaultValues, SignupSchema } from "@/src/server/auth/schema"
import getInvite from "@/src/server/invites/queries/getInvite"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export const SignupForm = () => {
  const router = useRouter()
  const [signupMutation] = useMutation(signup)
  const [formError, setFormError] = useState<string | null>(null)

  const paramInviteToken = useSearchParams()?.get("inviteToken") || null
  const [invite] = useQuery(getInvite, { token: paramInviteToken })

  const form = useAppForm({
    defaultValues: {
      ...signupFormDefaultValues,
      email: invite?.email || "",
      inviteToken: invite?.token || null,
    },
    validators: { onSubmit: SignupSchema } as never,
    onSubmit: async ({ value }) => {
      try {
        await signupMutation(value)
        router.push("/")
        router.refresh()
      } catch (error: unknown) {
        const result = improveErrorMessage(error, FORM_ERROR, ["email"])
        applyFormSubmitResult(form, result, setFormError)
      }
    },
  })

  return (
    <>
      <FormShell form={form} formError={formError} submitText="Registrieren">
        <form.AppField name="inviteToken">{(field) => <field.HiddenField />}</form.AppField>
        <form.AppField name="email">
          {(field) => (
            <field.TextField
              type="email"
              label={Boolean(invite?.email) ? "E-Mail-Adresse der Einladung" : "E-Mail-Adresse"}
              placeholder="name@beispiel.de"
              autoComplete="email"
              readOnly={Boolean(invite?.email)}
            />
          )}
        </form.AppField>
        <form.AppField name="firstName">
          {(field) => (
            <field.TextField type="text" label="Vorname" placeholder="" autoComplete="given-name" />
          )}
        </form.AppField>
        <form.AppField name="lastName">
          {(field) => (
            <field.TextField
              type="text"
              label="Nachname"
              placeholder=""
              autoComplete="family-name"
            />
          )}
        </form.AppField>
        <form.AppField name="institution">
          {(field) => (
            <field.TextField type="text" label="Organisation / Kommune" placeholder="" optional />
          )}
        </form.AppField>
        <form.AppField name="phone">
          {(field) => (
            <field.TextField
              type="tel"
              label="Telefon"
              placeholder=""
              autoComplete="tel"
              optional
            />
          )}
        </form.AppField>
        <form.AppField name="password">
          {(field) => (
            <field.TextField
              type="password"
              label="Passwort"
              placeholder=""
              autoComplete="current-password"
            />
          )}
        </form.AppField>
        <form.AppField name="privacyPolicyAccepted">
          {(field) => (
            <field.Checkbox
              label={
                <>
                  Ich habe die{" "}
                  <Link href="/datenschutz" blank>
                    Datenschutzerklärung
                  </Link>{" "}
                  gelesen und akzeptiere sie.
                </>
              }
              labelProps={{
                className:
                  "block cursor-pointer pl-3 text-sm font-medium whitespace-normal text-gray-700 hover:text-gray-900",
              }}
            />
          )}
        </form.AppField>
      </FormShell>

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
