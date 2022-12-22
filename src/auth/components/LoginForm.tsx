import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { AuthenticationError, PromiseReturnType } from "blitz"
import login from "src/auth/mutations/login"
import { Login } from "src/auth/validations"
import { FormLayout } from "src/core/components/forms"
import { Form, FORM_ERROR } from "src/core/components/forms/Form"
import { LabeledTextField } from "src/core/components/forms/LabeledTextField"
import { Link } from "src/core/components/links"

type LoginFormProps = {
  onSuccess?: (user: PromiseReturnType<typeof login>) => void
}

export const LoginForm = (props: LoginFormProps) => {
  const [loginMutation] = useMutation(login)

  return (
    <FormLayout title="Einloggen" subtitle="Willkommen zurück!">
      <Form
        submitText="Einloggen"
        schema={Login}
        initialValues={{ email: "", password: "" }}
        onSubmit={async (values) => {
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
        }}
      >
        <LabeledTextField name="email" label="Email" placeholder="Email" />
        <LabeledTextField name="password" label="Password" placeholder="Password" type="password" />
        <div>
          <Link href={Routes.ForgotPasswordPage()}>Passwort vergessen?</Link>
        </div>
      </Form>

      <div className="mt-4">
        Oder <Link href={Routes.SignupPage()}>registrieren</Link>
      </div>
    </FormLayout>
  )
}

export default LoginForm
