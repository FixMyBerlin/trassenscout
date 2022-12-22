import { LabeledTextField } from "src/core/components/LabeledTextField"
import { Form, FORM_ERROR } from "src/core/components/Form"
import signup from "src/auth/mutations/signup"
import { Signup } from "src/auth/validations"
import { useMutation } from "@blitzjs/rpc"
import { EyeDropperIcon } from "@heroicons/react/24/solid"
import Link from "next/link"
import { Routes } from "@blitzjs/next"

type SignupFormProps = {
  onSuccess?: () => void
}

export const SignupForm = (props: SignupFormProps) => {
  const [signupMutation] = useMutation(signup)

  const handleSubmit = async (values) => {
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
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-indigo-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <EyeDropperIcon className="mx-auto h-12 w-auto" />
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Anmelden
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">Willkommen!</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Form
            className="space-y-6"
            submitText="Anmelden"
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

              <div className="text-sm">
                <Link
                  href={Routes.ForgotPasswordPage()}
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Passwort vergessen
                </Link>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default SignupForm
