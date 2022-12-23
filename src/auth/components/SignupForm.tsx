import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import signup from "src/auth/mutations/signup"
import { Signup } from "src/auth/validations"
import { Form, FORM_ERROR } from "src/core/components/forms/Form"
import { LabeledTextField } from "src/core/components/forms/LabeledTextField"
import { Link } from "src/core/components/links"
import { LayoutMiddleBox } from "src/core/layouts"

type SignupFormProps = {
  onSuccess?: () => void
}

export const SignupForm = (props: SignupFormProps) => {
  const [signupMutation] = useMutation(signup)

  type HandleSubmit = { email: string; password: string }
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await signupMutation(values)
      props.onSuccess?.()
    } catch (error: any) {
      if (error.code === "P2002" && error.meta?.target?.includes("email")) {
        // This error comes from Prisma
        return { email: "This email is already being used" }
      } else {
        return { [FORM_ERROR]: error.toString() }
      }
    }
  }

  return (
    <LayoutMiddleBox title="Registrieren" subtitle="Willkommen!">
      <Form
        className="space-y-6"
        submitText="Registrieren"
        schema={Signup}
        initialValues={{ email: "", password: "" }}
        onSubmit={handleSubmit}
      >
        <LabeledTextField name="email" label="Email" placeholder="Email" autoComplete="email" />
        <LabeledTextField
          name="password"
          label="Password"
          placeholder="Password"
          type="password"
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          {/* <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Merken
                </label>
              </div> */}
        </div>
      </Form>

      <div className="mt-4">
        Oder{" "}
        <Link blank href={Routes.LoginPage()}>
          anmelden
        </Link>
      </div>
    </LayoutMiddleBox>
  )
}

export default SignupForm
