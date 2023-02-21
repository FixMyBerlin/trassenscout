import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { AuthenticationError, PromiseReturnType } from "blitz"
import login from "src/auth/mutations/login"
import { Login } from "src/auth/validations"
import { DevAdminBox } from "src/core/components/AdminBox"
import { Form, FORM_ERROR } from "src/core/components/forms/Form"
import { LabeledTextField } from "src/core/components/forms/LabeledTextField"
import { buttonStyles, Link } from "src/core/components/links"

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
        return { [FORM_ERROR]: "Sorry, those credentials are invalid" }
      } else {
        return {
          [FORM_ERROR]:
            "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
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
        <LabeledTextField name="email" label="E-Mail" placeholder="E-Mail" autoComplete="email" />
        <LabeledTextField
          name="password"
          label="Passwort"
          placeholder="Passwort"
          type="password"
          autoComplete="current-password"
        />
        <div className="text-sm">
          <Link href={Routes.ForgotPasswordPage()} className="font-medium">
            Passwort vergessen?
          </Link>
        </div>

        <DevAdminBox className="text-center">
          <button
            className={buttonStyles}
            onClick={async () =>
              await handleSubmit({
                email: "dev-team@fixmycity.de",
                password: "dev-team@fixmycity.de",
              })
            }
          >
            Login <code>dev-team@fixmycity.de</code>
          </button>
        </DevAdminBox>
      </Form>

      <div className="mt-4">
        Oder <Link href={Routes.SignupPage()}>registrieren</Link>
      </div>
    </>
  )
}

export default LoginForm
