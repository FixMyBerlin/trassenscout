import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { AuthenticationError, PromiseReturnType } from "blitz"
import login from "src/auth/mutations/login"
import { Login } from "src/auth/validations"
import { AdminBox } from "src/core/components/AdminBox"
import { Form, FORM_ERROR } from "src/core/components/forms/Form"
import { LabeledTextField } from "src/core/components/forms/LabeledTextField"
import { buttonStyles, Link } from "src/core/components/links"
import { LayoutMiddleBox } from "src/core/layouts"

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
        submitText="Einloggen"
        schema={Login}
        initialValues={{ email: "", password: "" }}
        onSubmit={handleSubmit}
      >
        <LabeledTextField name="email" label="Email" placeholder="Email" />
        <LabeledTextField name="password" label="Password" placeholder="Password" type="password" />
        <div className="text-sm">
          <Link href={Routes.ForgotPasswordPage()} className="font-medium">
            Passwort vergessen?
          </Link>
        </div>

        <AdminBox devOnly={true} className="text-center">
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
        </AdminBox>
      </Form>

      <div className="mt-4">
        Oder <Link href={Routes.SignupPage()}>registrieren</Link>
      </div>
    </>
  )
}

export default LoginForm
