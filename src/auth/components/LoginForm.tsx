import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { AuthenticationError, PromiseReturnType } from "blitz"
import login from "src/auth/mutations/login"
import { Login } from "src/auth/validations"
import { DevAdminBox } from "src/core/components/AdminBox"
import { Form, FORM_ERROR } from "src/core/components/forms/Form"
import { LabeledTextField } from "src/core/components/forms/LabeledTextField"
import { blueButtonStyles, Link } from "src/core/components/links"
import clsx from "clsx"

type LoginFormProps = {
  onSuccess?: (user: PromiseReturnType<typeof login>) => void
}

export const LoginForm = (props: LoginFormProps) => {
  const [loginMutation] = useMutation(login)

  type HandleSubmit = any // TODO
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
        initialValues={{ email: "", password: "" }}
        onSubmit={handleSubmit}
      >
        <LabeledTextField
          name="email"
          label="E-Mail-Adresse"
          placeholder="name@beispiel.de"
          autoComplete="email"
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
          {[
            ["admin", "admin@fixmycity.de"],
            ["all-projects", "all-projects@fixmycity.de"],
            ["no-project", "no-project@fixmycity.de"],
            ["rs23", "rs23@fixmycity.de"],
            ["rs3000", "rs3000@fixmycity.de"],
          ].map(([displayName, email]) => (
            <button
              key={displayName}
              className={clsx(blueButtonStyles, "m-1")}
              onClick={async () =>
                await handleSubmit({
                  email,
                  password: "dev-team@fixmycity.de",
                })
              }
            >
              {displayName}
            </button>
          ))}
        </DevAdminBox>
      </Form>

      <div className="mt-4 text-sm">
        Sie haben noch keinen Account? Zur <Link href={Routes.SignupPage()}>Registrierung</Link>.
      </div>
    </>
  )
}

export default LoginForm
