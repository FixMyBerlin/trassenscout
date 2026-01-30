"use client"

import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import deleteContact from "@/src/server/contacts/mutations/deleteContact"
import { useMutation } from "@blitzjs/rpc"
import { Route } from "next"

type Props = {
  contactId: number
  projectSlug: string
  contactTitle: string
  returnPath: Route
}

export const ContactDeleteActionBar = ({
  contactId,
  projectSlug,
  contactTitle,
  returnPath,
}: Props) => {
  const [deleteContactMutation] = useMutation(deleteContact)

  return (
    <DeleteActionBar
      itemTitle={contactTitle}
      onDelete={() => deleteContactMutation({ id: contactId, projectSlug })}
      returnPath={returnPath}
    />
  )
}
