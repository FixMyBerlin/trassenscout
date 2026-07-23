import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { createContactFn } from "@/src/server/contacts/contacts.functions"
import { ContactSchema } from "@/src/shared/contacts/schemas"
import { ContactForm } from "./ContactForm"

type CreatedContact = Awaited<ReturnType<typeof createContactFn>>

type Props = {
  projectSlug: string
  onSuccess?: (contact: CreatedContact) => void
  layout?: "default" | "drawer"
}

export const NewContactForm = ({ projectSlug, onSuccess, layout }: Props) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createContactMutation = useMutation({ mutationFn: createContactFn })

  type HandleSubmit = z.infer<typeof ContactSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    const tags = values.tags as string[] | boolean | false | undefined
    try {
      const contact = await createContactMutation.mutateAsync({
        data: {
          ...values,
          tags: tags === true ? false : tags,
          projectSlug,
        },
      })
      await queryClient.invalidateQueries({ queryKey: ["contacts", { projectSlug }] })
      if (onSuccess) {
        onSuccess(contact)
        return
      }
      void navigate({ to: `/${projectSlug}/contacts/${contact.id}` })
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["email"])
    }
  }

  return (
    <ContactForm
      submitText="Erstellen"
      backLink={
        layout === "drawer" ? null : (
          <BackLink
            to="/$projectSlug/contacts"
            params={{ projectSlug }}
            text="Zurück zur Übersicht"
          />
        )
      }
      schema={ContactSchema}
      projectSlug={projectSlug}
      onSubmit={handleSubmit}
      layout={layout}
    />
  )
}
