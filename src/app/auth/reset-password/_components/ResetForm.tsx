"use client"
import resetPassword from "@/src/auth/mutations/resetPassword"
import { ResetPassword } from "@/src/auth/schema"
import { FORM_ERROR, Form } from "@/src/core/components/forms/Form"
import { LabeledTextField } from "@/src/core/components/forms/LabeledTextField"
import { Link } from "@/src/core/components/links"
import { useMutation } from "@blitzjs/rpc"

type Props = { token: string }

export const ResetForm = ({ token }: Props) => {
  const [resetPasswordMutation, { isSuccess }] = useMutation(resetPassword)

  type HandleSubmit = { password: string; passwordConfirmation: string }
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      token && (await resetPasswordMutation({ ...values, token }))
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

  if (isSuccess) {
    return (
      <>
        <h2>Passwort erfolgreich zurückgesetzt.</h2>
        <p>
          Zur <Link href="/">Startseite</Link>
        </p>
      </>
    )
  }

  return (
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
  )
}
