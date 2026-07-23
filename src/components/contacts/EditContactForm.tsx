import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { SuperAdminLogData } from "@/src/components/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { getFullname } from "@/src/components/core/users/getFullname"
import { getM2MInitialValues } from "@/src/components/project-records/utils/getM2MInitialValues"
import { deleteContactFn, updateContactFn } from "@/src/server/contacts/contacts.functions"
import type { Contact } from "@/src/server/contacts/types"
import { ContactSchema } from "@/src/shared/contacts/schemas"
import { ContactForm } from "./ContactForm"

type UpdatedContact = Awaited<ReturnType<typeof updateContactFn>>

type Props = {
  contact: Contact
  projectSlug: string
  hideBackLink?: boolean
  hideSuperAdminLogData?: boolean
  returnPath?: string
  onSuccess?: (contact: UpdatedContact) => void
  layout?: "default" | "drawer"
}

export const EditContactForm = ({
  contact,
  projectSlug,
  hideBackLink,
  hideSuperAdminLogData,
  returnPath,
  onSuccess,
  layout,
}: Props) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const updateContactMutation = useMutation({ mutationFn: updateContactFn })
  const deleteContactMutation = useMutation({ mutationFn: deleteContactFn })

  const showPath = `/${projectSlug}/contacts/${contact.id}`
  const indexPath = `/${projectSlug}/contacts`

  type HandleSubmit = z.infer<typeof ContactSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    const tags = values.tags as string[] | boolean | false | undefined
    try {
      const updated = await updateContactMutation.mutateAsync({
        data: {
          ...values,
          tags: tags === true ? false : tags,
          id: contact.id,
          projectSlug,
        },
      })
      await queryClient.invalidateQueries({ queryKey: ["contacts", { projectSlug }] })
      await queryClient.invalidateQueries({
        queryKey: ["contact", { projectSlug, id: contact.id }],
      })
      if (onSuccess) {
        onSuccess(updated)
        return
      }
      void navigate({ to: `/${projectSlug}/contacts/${updated.id}` })
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["email"])
    }
  }

  return (
    <>
      <ContactForm
        submitText="Speichern"
        schema={ContactSchema}
        projectSlug={projectSlug}
        initialValues={{
          ...contact,
          tags: getM2MInitialValues(contact.tags) as unknown as HandleSubmit["tags"],
        }}
        onSubmit={handleSubmit}
        layout={layout}
        actionBarRight={
          <DeleteActionBar
            itemTitle={getFullname(contact) || "Kontakt"}
            onDelete={async () => {
              await deleteContactMutation.mutateAsync({ data: { id: contact.id, projectSlug } })
              await queryClient.invalidateQueries({ queryKey: ["contacts", { projectSlug }] })
            }}
            returnPath={returnPath ?? indexPath}
          />
        }
        backLink={hideBackLink ? null : <BackLink to={showPath} text="Zurück zum Kontakt" />}
      />

      {hideSuperAdminLogData ? null : <SuperAdminLogData data={contact} />}
    </>
  )
}
