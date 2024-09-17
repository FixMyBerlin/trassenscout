import forgotPassword from "@/src/auth/mutations/forgotPassword"
import { ForgotPassword } from "@/src/auth/validations"
import { Form, FORM_ERROR } from "@/src/core/components/forms/Form"
import { LabeledTextField } from "@/src/core/components/forms/LabeledTextField"
import { frenchQuote } from "@/src/core/components/text"
import { LayoutMiddleBox, MetaTags } from "@/src/core/layouts"
import { BlitzPage } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"

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
    <LayoutMiddleBox
      title="Passwort vergessen"
      subtitle="Bitte geben Sie Ihre E-Mail-Adresse ein, damit wir Ihnen einen Link zum Zurücksetzen Ihres Passwort senden können."
    >
      <MetaTags noindex title="Passwort vergessen" />
      {isSuccess ? (
        <div className="prose">
          <p>Wenn Ihre E-Mail-Adresse im System ist, sollten Sie eine E-Mail bekommen haben.</p>
          <p>Klicken Sie darin auf den Link {frenchQuote("Ein neues Passwort vergeben")}.</p>
        </div>
      ) : (
        <Form
          submitText="E-Mail zusenden"
          schema={ForgotPassword}
          initialValues={{ email: "" }}
          onSubmit={handleSubmit}
        >
          <LabeledTextField name="email" label="E-Mail-Adresse" placeholder="name@beispiel.de" />
        </Form>
      )}
    </LayoutMiddleBox>
  )
}

export default ForgotPasswordPage
