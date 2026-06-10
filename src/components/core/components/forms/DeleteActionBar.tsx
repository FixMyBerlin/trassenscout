import { TrashIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "@tanstack/react-router"
import { blueButtonStyles } from "@/src/components/core/components/links/styles"
import { frenchQuote } from "@/src/components/core/components/text/quote"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"

type Props = {
  itemTitle: string
  onDelete?: () => Promise<unknown>
  onClick?: () => Promise<unknown> | void
  returnPath: string
  variant?: "text" | "icon"
}

export const DeleteActionBar = ({
  itemTitle,
  onDelete,
  onClick,
  returnPath,
  variant = "icon",
}: Props) => {
  const navigate = useNavigate()

  const handleDelete = async () => {
    if (onClick) {
      try {
        await onClick()
      } catch (error) {
        console.error(`Error deleting ${itemTitle}:`, error)
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
      return
    }

    if (!onDelete) return

    if (window.confirm(`Möchten Sie ${frenchQuote(itemTitle)} wirklich unwiderruflich löschen?`)) {
      try {
        await onDelete()
        void navigate({ to: returnPath, replace: true })
      } catch (error) {
        console.error(`Error deleting ${itemTitle}:`, error)
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
        onClick={handleDelete}
        className={blueButtonStyles}
        title={`${itemTitle} löschen`}
      >
        {variant === "icon" ? <TrashIcon className="size-5" /> : "Löschen"}
      </button>
    </IfUserCanEdit>
  )
}
