import login from "@/src/auth/mutations/login"
import { Login } from "@/src/auth/schema"
import { DevAdminBox } from "@/src/core/components/AdminBox"
import { FORM_ERROR, Form } from "@/src/core/components/forms/Form"
import { HiddenField } from "@/src/core/components/forms/HiddenField"
import { LabeledTextField } from "@/src/core/components/forms/LabeledTextField"
import { Link, blueButtonStyles } from "@/src/core/components/links"
import getInvite from "@/src/invites/queries/getInvite"
import { Routes, useRouterQuery } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { AuthenticationError, PromiseReturnType } from "blitz"
import { clsx } from "clsx"
import { z } from "zod"

type LoginFormProps = {
  onSuccess?: (user: PromiseReturnType<typeof login>) => void
}

export const LoginForm = (props: LoginFormProps) => {
  const [loginMutation] = useMutation(login)
  const params = useRouterQuery()
  const [invite] = useQuery(getInvite, { token: String(params?.inviteToken) })

  type HandleSubmit = z.infer<typeof Login>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const user = await loginMutation(values)
      props.onSuccess?.(user)
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
          Sie haben Ihr <Link href={Routes.ForgotPasswordPage()}>Passwort vergessen?</Link>
        </div>

        <DevAdminBox className="text-center">
          <p className="text-sm">
            Invitation Token: {String(params?.inviteToken || "NOT FOUND")}
            <br />
            Invite: {invite ? "FOUND" : "NOT FOUND"}
          </p>
          <hr className="my-3 border border-white" />
          {(
            [
              ["admin", "admin@fixmycity.de"],
              ["all-projects-viewer", "all-projects-viewer@fixmycity.de"],
              ["all-projects-editor", "all-projects-editor@fixmycity.de"],
              ["no-project", "no-project@fixmycity.de"],
              ["rs23", "rs23@fixmycity.de"],
              ["rs3000", "rs3000@fixmycity.de"],
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
          href={Routes.SignupPage(params?.inviteToken ? { inviteToken: params?.inviteToken } : {})}
        >
          Registrierung
        </Link>
        .
      </div>
    </>
  )
}

export default LoginForm
