import { useMutation } from "@tanstack/react-query"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { deleteContactFn } from "@/src/server/contacts/contacts.functions"

type Props = {
  contactId: number
  projectSlug: string
  contactTitle: string
  returnPath: string
}

export const ContactDeleteActionBar = ({
  contactId,
  projectSlug,
  contactTitle,
  returnPath,
}: Props) => {
  const deleteContactMutation = useMutation({ mutationFn: deleteContactFn })

  return (
    <DeleteActionBar
      itemTitle={contactTitle}
      onDelete={() => deleteContactMutation.mutateAsync({ data: { id: contactId, projectSlug } })}
      returnPath={returnPath}
    />
  )
}
