import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { createContactFn } from "@/src/server/contacts/contacts.functions"
import { ContactSchema } from "@/src/shared/contacts/schemas"
import { ContactForm } from "./ContactForm"

type Props = {
  projectSlug: string
}

export const NewContactForm = ({ projectSlug }: Props) => {
  const navigate = useNavigate()
  const createContactMutation = useMutation({ mutationFn: createContactFn })

  type HandleSubmit = z.infer<typeof ContactSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const contact = await createContactMutation.mutateAsync({
        data: { ...values, projectSlug },
      })
      void navigate({ to: `/${projectSlug}/contacts/${contact.id}` })
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["email"])
    }
  }

  return <ContactForm submitText="Erstellen" schema={ContactSchema} onSubmit={handleSubmit} />
}
