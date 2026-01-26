"use client"

import { ContactForm } from "@/src/app/(loggedInProjects)/[projectSlug]/contacts/_components/ContactForm"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { DeleteAndBackLinkFooter } from "@/src/core/components/forms/DeleteAndBackLinkFooter"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import deleteContact from "@/src/server/contacts/mutations/deleteContact"
import updateContact from "@/src/server/contacts/mutations/updateContact"
import { useMutation } from "@blitzjs/rpc"
import { Contact } from "@prisma/client"
import { Route } from "next"
import { useRouter } from "next/navigation"

type Props = {
  contact: Contact
  projectSlug: string
}

export const EditContactForm = ({ contact, projectSlug }: Props) => {
  const router = useRouter()
  const [updateContactMutation] = useMutation(updateContact)
  const [deleteContactMutation] = useMutation(deleteContact)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateContactMutation({
        ...values,
        id: contact.id,
        projectSlug,
      })
      await router.push(`/${projectSlug}/contacts/${updated.id}` as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["email"])
    }
  }

  return (
    <>
      <ContactForm submitText="Speichern" initialValues={contact} onSubmit={handleSubmit} />

      <DeleteAndBackLinkFooter
        fieldName="Kontakt"
        id={contact.id}
        deleteAction={{ mutate: () => deleteContactMutation({ id: contact.id, projectSlug }) }}
        backHref={`/${projectSlug}/contacts` as Route}
        backText="Zurück zu den Kontakten"
      />

      <SuperAdminLogData data={contact} />
    </>
  )
}
