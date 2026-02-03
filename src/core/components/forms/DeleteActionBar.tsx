"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { blueButtonStyles } from "@/src/core/components/links"
import { frenchQuote } from "@/src/core/components/text/quote"
import { TrashIcon } from "@heroicons/react/24/outline"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { twMerge } from "tailwind-merge"

type Props = {
  itemTitle: string
  onDelete?: () => Promise<unknown>
  onClick?: () => Promise<unknown> | void
  returnPath: Route
  variant?: "text" | "icon"
}

export const DeleteActionBar = ({
  itemTitle,
  onDelete,
  onClick,
  returnPath,
  variant = "icon",
}: Props) => {
  const router = useRouter()

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
        router.push(returnPath as Route<string>)
        router.refresh()
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
        className={twMerge(
          blueButtonStyles,
          "enabled:hover:bg-red-600 enabled:hover:text-white",
          "enabled:active:bg-red-500 enabled:active:ring-red-600",
        )}
        title={`${itemTitle} löschen`}
      >
        {variant === "icon" ? <TrashIcon className="size-5" /> : "Löschen"}
      </button>
    </IfUserCanEdit>
  )
}
