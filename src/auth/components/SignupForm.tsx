import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import signup from "src/auth/mutations/signup"
import { Signup } from "src/auth/validations"
import { errorMessageTranslations } from "src/core/components/forms"
import { Form, FORM_ERROR } from "src/core/components/forms/Form"
import { LabeledTextField } from "src/core/components/forms/LabeledTextField"
import { Link } from "src/core/components/links"

type SignupFormProps = {
  onSuccess?: () => void
}

export const SignupForm = (props: SignupFormProps) => {
  const [signupMutation] = useMutation(signup)

  type HandleSubmit = {
    email: string
    firstName: string | null
    phone: string | null
    lastName: string | null
    password: string
  }
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await signupMutation(values)
      props.onSuccess?.()
    } catch (error: any) {
      if (error.code === "P2002" && error.meta?.target?.includes("email")) {
        // This error comes from Prisma
        return {
          email: errorMessageTranslations[error.message],
        }
      } else {
        return { [FORM_ERROR]: error }
      }
    }
  }

  return (
    <>
      <Form
        submitText="Registrieren"
        schema={Signup}
        initialValues={{ email: "", password: "" }}
        onSubmit={handleSubmit}
      >
        <LabeledTextField
          type="email"
          name="email"
          label="E-Mail-Adresse"
          placeholder="name@beispiel.de"
          autoComplete="email"
        />
        <LabeledTextField
          name="firstName"
          label="Vorname"
          placeholder=""
          autoComplete="given-name"
          optional
        />
        <LabeledTextField
          name="lastName"
          label="Nachname"
          placeholder=""
          autoComplete="family-name"
          optional
        />
        <LabeledTextField
          type="tel"
          name="phone"
          label="Telefon"
          placeholder=""
          autoComplete="tel"
          optional
        />
        <LabeledTextField
          name="password"
          label="Passwort"
          placeholder=""
          type="password"
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          {/* <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Merken
                </label>
              </div> */}
        </div>
      </Form>

      <div className="mt-4">
        Sie haben bereits einen Account? Zur{" "}
        <Link blank href={Routes.LoginPage()}>
          Anmeldung
        </Link>
        .
      </div>
    </>
  )
}

export default SignupForm
