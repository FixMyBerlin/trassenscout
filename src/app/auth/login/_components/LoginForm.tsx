"use client"
import { DevAdminBox } from "@/src/core/components/AdminBox"
import { FORM_ERROR, Form } from "@/src/core/components/forms/Form"
import { HiddenField } from "@/src/core/components/forms/HiddenField"
import { LabeledTextField } from "@/src/core/components/forms/LabeledTextField"
import { Link, blueButtonStyles } from "@/src/core/components/links"
import login from "@/src/server/auth/mutations/login"
import { Login } from "@/src/server/auth/schema"
import getInvite from "@/src/server/invites/queries/getInvite"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { AuthenticationError } from "blitz"
import { clsx } from "clsx"
import { Route } from "next"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"

export const LoginForm = () => {
  const router = useRouter()
  const params = useSearchParams()
  const paramNext = params?.get("next") || null
  const paramInviteToken = params?.get("inviteToken") || null
  // const currentUser = useCurrentUser()
  // const [logoutMutation] = useMutation(logout)
  // const handleLogout = async () => {
  //   await logoutMutation()
  // }

  const [loginMutation] = useMutation(login)
  const [invite] = useQuery(getInvite, { token: paramInviteToken })

  type HandleSubmit = z.infer<typeof Login>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await loginMutation(values)
      const next = paramNext ? decodeURIComponent(paramNext) : "/"
      // TS: I don't see a way to validate the nextParam, so we overwrite TS here
      router.push(next as Route<string>)
      router.refresh()
    } catch (error: any) {
      if (error instanceof AuthenticationError) {
        return { [FORM_ERROR]: "Diese Anmeldedaten sind ungültig." }
      } else {
        return {
          [FORM_ERROR]: "Ein unerwarteter Fehler ist aufgetreten. - " + error.toString(),
        }
      }
    }
  }

  return (
    <>
      <Form
        submitText="Anmelden"
        schema={Login}
        initialValues={{
          email: invite?.email || "",
          password: "",
          inviteToken: invite?.token || null,
        }}
        onSubmit={handleSubmit}
      >
        <HiddenField name="inviteToken" />
        <LabeledTextField
          name="email"
          label={Boolean(invite?.email) ? "E-Mail-Adresse der Einladung" : "E-Mail-Adresse"}
          placeholder="name@beispiel.de"
          autoComplete="email"
          readOnly={Boolean(invite?.email)}
        />
        <LabeledTextField
          name="password"
          label="Passwort"
          placeholder="Passwort"
          type="password"
          autoComplete="current-password"
        />
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
              className={clsx(blueButtonStyles, "m-1")}
              onClick={async () =>
                await handleSubmit({
                  email,
                  password: "dev-team@fixmycity.de",
                  inviteToken: null,
                })
              }
            >
              {displayName}
            </button>
          ))}
        </DevAdminBox>
      </Form>

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
