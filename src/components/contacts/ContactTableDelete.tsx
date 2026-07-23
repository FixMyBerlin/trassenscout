import { useMutation, useQueryClient } from "@tanstack/react-query"
import { twJoin } from "tailwind-merge"
import { linkIcons } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { frenchQuote } from "@/src/components/core/components/text/quote"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { deleteContactFn } from "@/src/server/contacts/contacts.functions"

type Props = {
  contactId: number
  projectSlug: string
  contactTitle: string
}

export const ContactTableDelete = ({ contactId, projectSlug, contactTitle }: Props) => {
  const queryClient = useQueryClient()
  const deleteContactMutation = useMutation({ mutationFn: deleteContactFn })

  const handleDelete = async () => {
    if (
      window.confirm(`Möchten Sie ${frenchQuote(contactTitle)} wirklich unwiderruflich löschen?`)
    ) {
      try {
        await deleteContactMutation.mutateAsync({ data: { id: contactId, projectSlug } })
        await queryClient.invalidateQueries({ queryKey: ["contacts", { projectSlug }] })
      } catch {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
  }

  return (
    <IfUserCanEdit>
      <button
        type="button"
        onClick={() => void handleDelete()}
        className={twJoin(
          "inline-flex cursor-pointer items-center justify-center gap-1",
          linkStyles,
        )}
      >
        {linkIcons["delete"]}
        Löschen
      </button>
    </IfUserCanEdit>
  )
}
