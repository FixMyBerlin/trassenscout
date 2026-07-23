import { TrashIcon } from "@heroicons/react/24/outline"
import { useNavigate } from "@tanstack/react-router"
import { twJoin } from "tailwind-merge"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { linkIcons } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { frenchQuote } from "@/src/components/core/components/text/quote"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"

type Props = {
  itemTitle: string
  onDelete?: () => Promise<unknown>
  onClick?: () => Promise<unknown> | void
  onDeleted?: () => void | Promise<void>
  returnPath: string
  variant?: "text" | "icon" | "linkWithIcon"
}

export const DeleteActionBar = ({
  itemTitle,
  onDelete,
  onClick,
  onDeleted,
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
        if (onDeleted) {
          await onDeleted()
        } else {
          void navigate({ to: returnPath, replace: true })
        }
      } catch (error) {
        console.error(`Error deleting ${itemTitle}:`, error)
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
  }

  if (variant === "linkWithIcon") {
    return (
      <IfUserCanEdit>
        <button
          type="button"
          onClick={handleDelete}
          className={twJoin(
            "inline-flex cursor-pointer items-center justify-center gap-1",
            linkStyles,
          )}
          title={`${itemTitle} löschen`}
        >
          {linkIcons["delete"]}
          Löschen
        </button>
      </IfUserCanEdit>
    )
  }

  return (
    <IfUserCanEdit>
      <button
        type="button"
        onClick={handleDelete}
        className={primaryButtonClassName}
        title={`${itemTitle} löschen`}
      >
        {variant === "icon" ? <TrashIcon className="size-5" /> : "Löschen"}
      </button>
    </IfUserCanEdit>
  )
}
