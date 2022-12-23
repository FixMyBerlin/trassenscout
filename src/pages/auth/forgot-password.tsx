import { BlitzPage } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import forgotPassword from "src/auth/mutations/forgotPassword"
import { ForgotPassword } from "src/auth/validations"
import { Form, FORM_ERROR } from "src/core/components/forms/Form"
import { LabeledTextField } from "src/core/components/forms/LabeledTextField"
import { frenchQuote } from "src/core/components/text"
import { Layout, LayoutMiddleBox, MetaTags } from "src/core/layouts"

const ForgotPasswordPage: BlitzPage = () => {
  const [forgotPasswordMutation, { isSuccess }] = useMutation(forgotPassword)

  type HandleSubmit = { email: string }
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await forgotPasswordMutation(values)
    } catch (error: any) {
      return {
        [FORM_ERROR]: "Sorry, we had an unexpected error. Please try again.",
      }
    }
  }

  return (
    <Layout>
      <MetaTags noindex title="Passwort vergessen" />
      <LayoutMiddleBox title="Passwort vergessen">
        {isSuccess ? (
          <div className="prose">
            <h2 className="text-center">Anfrage empfangen</h2>
            <p>Wenn deine E-Mail-Adresse im System ist, senden wir dir jetzt eine E-Mail.</p>
            <p>Klicke darin auf den Link {frenchQuote("Ein neues Passwort vergeben")}.</p>
          </div>
        ) : (
          <Form
            submitText="E-Mail zum Passwort ändern zusenden…"
            schema={ForgotPassword}
            initialValues={{ email: "" }}
            onSubmit={handleSubmit}
          >
            <LabeledTextField name="email" label="E-Mail-Adresse" placeholder="name@beispiel.de" />
          </Form>
        )}
      </LayoutMiddleBox>
    </Layout>
  )
}

export default ForgotPasswordPage
