import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import resetPassword from "src/auth/mutations/resetPassword"
import { ResetPassword } from "src/auth/validations"
import { Form, FORM_ERROR } from "src/core/components/forms/Form"
import { LabeledTextField } from "src/core/components/forms/LabeledTextField"
import { Layout, LayoutMiddleBox, MetaTags } from "src/core/layouts"

const ResetPasswordPage: BlitzPage = () => {
  const [token, setToken] = useState("")
  const router = useRouter()
  const [resetPasswordMutation, { isSuccess }] = useMutation(resetPassword)

  useEffect(() => {
    setToken(router.query.token as string)
  }, [router.isReady])

  type HandleSubmit = { password: string; passwordConfirmation: string }
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await resetPasswordMutation({ ...values, token })
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
    <div>
      {isSuccess ? (
        <div>
          <h2>Password Reset Successfully</h2>
          <p>
            Go to the <Link href={Routes.Home()}>homepage</Link>
          </p>
        </div>
      ) : (
        <Form
          className="space-y-6"
          submitText="Reset Password"
          schema={ResetPassword}
          initialValues={{
            password: "",
            passwordConfirmation: "",
            token,
          }}
          onSubmit={handleSubmit}
        >
          <LabeledTextField name="password" label="New Password" type="password" />
          <LabeledTextField
            name="passwordConfirmation"
            label="Confirm New Password"
            type="password"
          />
        </Form>
      )}
    </div>
  )
}

ResetPasswordPage.redirectAuthenticatedTo = "/"
ResetPasswordPage.getLayout = (page) => (
  <Layout>
    <MetaTags noindex title="Passwort vergessen" />
    <LayoutMiddleBox title="Neues Passwort vergeben">{page}</LayoutMiddleBox>
  </Layout>
)

export default ResetPasswordPage
