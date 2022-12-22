import Layout from "src/core/layouts/Layout"
import { LabeledTextField } from "src/core/components/forms/LabeledTextField"
import { Form, FORM_ERROR } from "src/core/components/forms/Form"
import { ForgotPassword } from "src/auth/validations"
import forgotPassword from "src/auth/mutations/forgotPassword"
import { useMutation } from "@blitzjs/rpc"
import { BlitzPage } from "@blitzjs/next"
import { MetaTags } from "src/core/layouts/MetaTags"
import { FormLayout } from "src/core/components/forms"

const ForgotPasswordPage: BlitzPage = () => {
  const [forgotPasswordMutation, { isSuccess }] = useMutation(forgotPassword)

  return (
    <Layout>
      <MetaTags noindex title="Passwort vergessen" />
      <FormLayout title="Passwort vergessen">
        {isSuccess ? (
          <>
            <h2>Anfrage empfangen</h2>
            <p>
              Wenn deine E-Mail-Adresse im System ist, senden wir dir jetzt eine E-Mail über die du
              ein neues Passwort vergeben kannst.
            </p>
          </>
        ) : (
          <Form
            className="space-y-6"
            submitText="E-Mail zum Passwort ändern zusenden…"
            schema={ForgotPassword}
            initialValues={{ email: "" }}
            onSubmit={async (values) => {
              try {
                await forgotPasswordMutation(values)
              } catch (error: any) {
                return {
                  [FORM_ERROR]: "Sorry, we had an unexpected error. Please try again.",
                }
              }
            }}
          >
            <LabeledTextField name="email" label="Email" placeholder="Email" />
          </Form>
        )}
      </FormLayout>
    </Layout>
  )
}

export default ForgotPasswordPage
