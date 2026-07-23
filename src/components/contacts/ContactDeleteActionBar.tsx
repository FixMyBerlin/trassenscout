import { useMutation, useQueryClient } from "@tanstack/react-query"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { deleteContactFn } from "@/src/server/contacts/contacts.functions"

type Props = {
  contactId: number
  projectSlug: string
  contactTitle: string
  returnPath: string
  onDeleted?: () => void | Promise<void>
  variant?: "text" | "icon" | "linkWithIcon"
}

export const ContactDeleteActionBar = ({
  contactId,
  projectSlug,
  contactTitle,
  returnPath,
  onDeleted,
  variant,
}: Props) => {
  const queryClient = useQueryClient()
  const deleteContactMutation = useMutation({ mutationFn: deleteContactFn })

  return (
    <DeleteActionBar
      itemTitle={contactTitle}
      onDelete={async () => {
        await deleteContactMutation.mutateAsync({ data: { id: contactId, projectSlug } })
        await queryClient.invalidateQueries({ queryKey: ["contacts", { projectSlug }] })
      }}
      onDeleted={onDeleted}
      returnPath={returnPath}
      variant={variant}
    />
  )
}
