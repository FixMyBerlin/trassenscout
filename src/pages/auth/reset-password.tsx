import resetPassword from "@/src/auth/mutations/resetPassword"
import { ResetPassword } from "@/src/auth/validations"
import { FORM_ERROR, Form } from "@/src/core/components/forms/Form"
import { LabeledTextField } from "@/src/core/components/forms/LabeledTextField"
import { LayoutMiddleBox, MetaTags } from "@/src/core/layouts"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import Link from "next/link"
import { useRouter } from "next/router"

const ResetPasswordPage: BlitzPage = () => {
  const router = useRouter()
  const token = router.query.token?.toString()
  const [resetPasswordMutation, { isSuccess }] = useMutation(resetPassword)

  type PageState = "token_missing" | "success" | "form"
  let pageState: PageState = "form"
  if (typeof token !== "string") pageState = "token_missing"
  if (isSuccess) pageState = "success"

  type HandleSubmit = { password: string; passwordConfirmation: string }
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      token && (await resetPasswordMutation({ ...values, token: token }))
    } catch (error: any) {
      if (error.name === "ResetPasswordError") {
        return {
          [FORM_ERROR]: error.message,
        }
      } else {
        return {
          [FORM_ERROR]: "Sorry, we had an unexpected error. Please try again.",
        }
      }
    }
  }

  return (
    <LayoutMiddleBox title="Neues Passwort vergeben">
      <MetaTags noindex title="Passwort vergessen" />
      {pageState === "token_missing" && (
        <div>
          <h2>Dieser Link ist ungültig.</h2>
        </div>
      )}
      {pageState === "success" && (
        <div>
          <h2>Passwort erfolgreich zurückgesetzt.</h2>
          <p>
            Zur <Link href={Routes.Home()}>Startseite</Link>
          </p>
        </div>
      )}
      {pageState === "form" && (
        <Form
          submitText="Passwort zurücksetzen"
          schema={ResetPassword}
          initialValues={{
            password: "",
            passwordConfirmation: "",
            token,
          }}
          onSubmit={handleSubmit}
        >
          <LabeledTextField name="password" label="Neues Passwort" type="password" />
          <LabeledTextField
            name="passwordConfirmation"
            label="Neues Passwort bestätigen"
            type="password"
          />
        </Form>
      )}
    </LayoutMiddleBox>
  )
}

ResetPasswordPage.redirectAuthenticatedTo = "/"

export default ResetPasswordPage
