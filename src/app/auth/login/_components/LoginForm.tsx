"use client"

import { DevAdminBox } from "@/src/core/components/AdminBox"
import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  FORM_ERROR,
} from "@/src/core/components/forms/utils/formSubmitResult"
import { blueButtonStyles, Link } from "@/src/core/components/links"
import login from "@/src/server/auth/mutations/login"
import { Login, loginFormDefaultValues } from "@/src/server/auth/schema"
import getInvite from "@/src/server/invites/queries/getInvite"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { AuthenticationError } from "blitz"
import { clsx } from "clsx"
import { Route } from "next"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { z } from "zod"

export const LoginForm = () => {
  const router = useRouter()
  const params = useSearchParams()
  const paramNext = params?.get("next") || null
  const paramInviteToken = params?.get("inviteToken") || null

  const [loginMutation] = useMutation(login)
  const [invite] = useQuery(getInvite, { token: paramInviteToken })
  const [formError, setFormError] = useState<string | null>(null)

  const submitLogin = async (values: z.infer<typeof Login>) => {
    try {
      await loginMutation(values)
      const next = paramNext ? decodeURIComponent(paramNext) : "/"
      // TS: I don't see a way to validate the nextParam, so we overwrite TS here
      router.push(next as Route<string>)
      router.refresh()
    } catch (error: unknown) {
      if (error instanceof AuthenticationError) {
        return { [FORM_ERROR]: "Diese Anmeldedaten sind ungültig." }
      }
      return {
        [FORM_ERROR]: "Ein unerwarteter Fehler ist aufgetreten. - " + String(error),
      }
    }
  }

  const form = useAppForm({
    defaultValues: {
      ...loginFormDefaultValues,
      email: invite?.email || "",
      inviteToken: invite?.token || null,
    },
    validators: { onSubmit: Login } as never,
    onSubmit: async ({ value }) => {
      const result = (await submitLogin(value)) || {}
      applyFormSubmitResult(form, result, setFormError)
    },
  })

  return (
    <>
      <FormShell form={form} formError={formError} submitText="Anmelden">
        <form.AppField name="inviteToken">{(field) => <field.HiddenField />}</form.AppField>
        <form.AppField name="email">
          {(field) => (
            <field.TextField
              type="text"
              label={Boolean(invite?.email) ? "E-Mail-Adresse der Einladung" : "E-Mail-Adresse"}
              placeholder="name@beispiel.de"
              autoComplete="email"
              readOnly={Boolean(invite?.email)}
            />
          )}
        </form.AppField>
        <form.AppField name="password">
          {(field) => (
            <field.TextField
              type="password"
              label="Passwort"
              placeholder="Passwort"
              autoComplete="current-password"
            />
          )}
        </form.AppField>
        <div className="text-sm">
          Sie haben Ihr <Link href="/auth/forgot-password">Passwort vergessen?</Link>
        </div>

        <DevAdminBox className="text-center">
          <p className="text-sm">
            Invitation Token: {paramInviteToken || "NOT FOUND"}
            <br />
            Invite: {invite ? "FOUND" : "NOT FOUND"}
          </p>
          <hr className="my-3 border border-white" />
          {(
            [
              ["admin", "admin@fixmycity.test"],
              ["all-projects-viewer", "all-projects-viewer@fixmycity.test"],
              ["all-projects-editor", "all-projects-editor@fixmycity.test"],
              ["no-project", "no-project@fixmycity.test"],
              ["rs23", "rs23@fixmycity.test"],
              ["rs3000", "rs3000@fixmycity.test"],
            ] as const
          ).map(([displayName, email]) => (
            <button
              key={displayName}
              type="button"
              className={clsx(blueButtonStyles, "m-1")}
              onClick={async () => {
                const result =
                  (await submitLogin({
                    email,
                    password: "dev-team@fixmycity.de",
                    inviteToken: null,
                  })) || {}
                applyFormSubmitResult(form, result, setFormError)
              }}
            >
              {displayName}
            </button>
          ))}
        </DevAdminBox>
      </FormShell>

      <div className="mt-4 text-sm">
        Sie haben noch keinen Account? Zur{" "}
        <Link
          href={{
            pathname: "/auth/signup",
            query: { inviteToken: paramInviteToken },
          }}
        >
          Registrierung
        </Link>
        .
      </div>
    </>
  )
}
