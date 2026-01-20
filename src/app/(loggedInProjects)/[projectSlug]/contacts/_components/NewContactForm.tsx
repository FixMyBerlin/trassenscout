"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createContact from "@/src/server/contacts/mutations/createContact"
import { ContactSchema } from "@/src/server/contacts/schema"
import { useMutation } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { ContactForm } from "./ContactForm"

type Props = {
  projectSlug: string
}

export const NewContactForm = ({ projectSlug }: Props) => {
  const router = useRouter()
  const [createContactMutation] = useMutation(createContact)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const contact = await createContactMutation({ ...values, projectSlug })
      await router.push(`/${projectSlug}/contacts/${contact.id}` as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["email"])
    }
  }

  return <ContactForm submitText="Erstellen" schema={ContactSchema} onSubmit={handleSubmit} />
}
