"use client"

import { ContactForm } from "@/src/app/(loggedInProjects)/[projectSlug]/contacts/_components/ContactForm"
import { getFullname } from "@/src/app/_components/users/utils/getFullname"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import deleteContact from "@/src/server/contacts/mutations/deleteContact"
import updateContact from "@/src/server/contacts/mutations/updateContact"
import { ContactSchema } from "@/src/server/contacts/schema"
import { useMutation } from "@blitzjs/rpc"
import { Contact } from "@prisma/client"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"

type Props = {
  contact: Contact
  projectSlug: string
}

export const EditContactForm = ({ contact, projectSlug }: Props) => {
  const router = useRouter()
  const [updateContactMutation] = useMutation(updateContact)
  const [deleteContactMutation] = useMutation(deleteContact)

  const showPath = `/${projectSlug}/contacts/${contact.id}` as Route
  const indexPath = `/${projectSlug}/contacts` as Route

  type HandleSubmit = z.infer<typeof ContactSchema>
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
      <ContactForm
        submitText="Speichern"
        schema={ContactSchema}
        initialValues={contact}
        onSubmit={handleSubmit}
        actionBarRight={
          <DeleteActionBar
            itemTitle={getFullname(contact) || "Kontakt"}
            onDelete={() => deleteContactMutation({ id: contact.id, projectSlug })}
            returnPath={indexPath}
          />
        }
      />

      <BackLink href={showPath} text="Zurück zum Kontakt" />

      <SuperAdminLogData data={contact} />
    </>
  )
}
