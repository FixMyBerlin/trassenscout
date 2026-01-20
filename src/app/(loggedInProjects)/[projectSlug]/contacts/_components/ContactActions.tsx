"use client"

import { linkStyles } from "@/src/core/components/links"
import deleteContact from "@/src/server/contacts/mutations/deleteContact"
import { useMutation } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/navigation"

type Props = {
  contactId: number
  projectSlug: string
}

export const ContactActions = ({ contactId, projectSlug }: Props) => {
  const router = useRouter()
  const [deleteContactMutation] = useMutation(deleteContact)

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${contactId} unwiderruflich löschen?`)) {
      try {
        await deleteContactMutation({ id: contactId, projectSlug })
      } catch (error) {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
        return
      }
      await router.push(`/${projectSlug}/contacts` as Route)
      router.refresh()
    }
  }

  return (
    <button type="button" onClick={handleDelete} className={linkStyles}>
      Eintrag löschen
    </button>
  )
}
