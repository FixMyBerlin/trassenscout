import signup from "@/src/auth/mutations/signup"
import { Signup } from "@/src/auth/validations"
import { DevAdminBox } from "@/src/core/components/AdminBox/DevAdminBox"
import { FORM_ERROR, Form } from "@/src/core/components/forms/Form"
import { HiddenField } from "@/src/core/components/forms/HiddenField"
import { LabeledTextField } from "@/src/core/components/forms/LabeledTextField"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import getInvite from "@/src/invites/queries/getInvite"
import { Routes, useRouterQuery } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"

type SignupFormProps = {
  onSuccess?: () => void
}

export const SignupForm = (props: SignupFormProps) => {
  const [signupMutation] = useMutation(signup)
  const params = useRouterQuery()
  const [invite] = useQuery(getInvite, { token: String(params?.inviteToken) })

  type HandleSubmit = {
    email: string
    firstName: string
    lastName: string
    institution: string | null
    phone: string | null
    password: string
    inviteToken: string | null
  }
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await signupMutation(values)
      props.onSuccess?.()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["email"])
    }
  }

  return (
    <>
      <Form
        submitText="Registrieren"
        schema={Signup}
        initialValues={{
          email: invite?.email || "",
          password: "",
          inviteToken: invite?.token || null,
        }}
        onSubmit={handleSubmit}
      >
        <HiddenField name="inviteToken" />
        <LabeledTextField
          type="email"
          name="email"
          label={Boolean(invite?.email) ? "E-Mail-Adresse der Einladung" : "E-Mail-Adresse"}
          placeholder="name@beispiel.de"
          autoComplete="email"
          readOnly={Boolean(invite?.email)}
        />
        <LabeledTextField
          name="firstName"
          label="Vorname"
          placeholder=""
          autoComplete="given-name"
        />
        <LabeledTextField
          name="lastName"
          label="Nachname"
          placeholder=""
          autoComplete="family-name"
        />
        <LabeledTextField
          name="institution"
          label="Organisation / Kommune"
          placeholder=""
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

      <DevAdminBox className="text-center">
        <p className="text-sm">
          Invitation Token: {String(params?.inviteToken || "NOT FOUND")}
          <br />
          Invite: {invite ? "FOUND" : "NOT FOUND"}
        </p>
      </DevAdminBox>

      <div className="mt-4">
        Sie haben bereits einen Account? Zur{" "}
        <Link href={Routes.LoginPage({ inviteToken: params?.inviteToken })}>Anmeldung</Link>.
      </div>
    </>
  )
}

export default SignupForm
