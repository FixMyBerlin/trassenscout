"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { Link, linkStyles } from "@/src/core/components/links"
import { RouteUrlObject } from "blitz"
import { clsx } from "clsx"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { UrlObject } from "url"

type DeleteAction = {
  mutate: () => Promise<unknown>
}

type Props = {
  fieldName: string
  id: number
  backText: string
  backHref: RouteUrlObject | UrlObject | string | Route
  deleteAction?: DeleteAction
  deleteButton?: React.ReactNode
}

export const DeleteAndBackLinkFooter = ({
  fieldName,
  id,
  backHref,
  backText,
  deleteButton,
  deleteAction,
}: Props) => {
  const router = useRouter()

  // Build handleDelete from deleteAction if provided
  const handleDeleteFromAction = deleteAction
    ? async () => {
        if (window.confirm(`${fieldName} mit ID ${id} unwiderruflich löschen?`)) {
          try {
            await deleteAction.mutate()
            router.push(backHref as Route)
            router.refresh()
          } catch (error) {
            alert(
              "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
            )
          }
        }
      }
    : undefined

  const hasDelete = !!deleteButton || !!handleDeleteFromAction

  return (
    <>
      {hasDelete && (
        <div className="mt-12 flex items-center">
          <IfUserCanEdit>
            {deleteButton ? (
              deleteButton
            ) : handleDeleteFromAction ? (
              <button
                type="button"
                onClick={handleDeleteFromAction}
                className={clsx(linkStyles, "my-0 cursor-pointer")}
              >
                {`${fieldName} löschen`}
              </button>
            ) : null}
          </IfUserCanEdit>
        </div>
      )}
      <hr className="my-5 text-gray-200" />
      <Link icon="back" href={backHref}>
        {backText}
      </Link>
    </>
  )
}
