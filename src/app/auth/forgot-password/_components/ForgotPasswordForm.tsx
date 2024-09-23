"use client"
import forgotPassword from "@/src/auth/mutations/forgotPassword"
import { ForgotPassword } from "@/src/auth/schema"
import { FORM_ERROR, Form } from "@/src/core/components/forms/Form"
import { LabeledTextField } from "@/src/core/components/forms/LabeledTextField"
import { frenchQuote } from "@/src/core/components/text/quote"
import { useMutation } from "@blitzjs/rpc"

export const ForgotPasswordForm = () => {
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

  if (isSuccess) {
    return (
      <div className="prose">
        <p>Wenn Ihre E-Mail-Adresse im System ist, sollten Sie eine E-Mail bekommen haben.</p>
        <p>Klicken Sie darin auf den Link {frenchQuote("Ein neues Passwort vergeben")}.</p>
      </div>
    )
  }

  return (
    <Form
      submitText="E-Mail zusenden"
      schema={ForgotPassword}
      initialValues={{ email: "" }}
      onSubmit={handleSubmit}
    >
      <LabeledTextField name="email" label="E-Mail-Adresse" placeholder="name@beispiel.de" />
    </Form>
  )
}
