"use client"

import { linkIcons, linkStyles } from "@/src/core/components/links"
import { frenchQuote } from "@/src/core/components/text/quote"
import { Tooltip } from "@/src/core/components/Tooltip/Tooltip"
import deleteSurveyUploadPublic from "@/src/server/uploads/mutations/deleteSurveyUploadPublic"
import { useMutation } from "@blitzjs/rpc"
import { TrashIcon } from "@heroicons/react/24/outline"
import { clsx } from "clsx"

const DISABLED_PUBLIC_DELETE_TOOLTIP =
  "Dieses Dokument kann hier nicht gelöscht werden, da es in einer anderen Browser-Sitzung hochgeladen wurde. Bitte schreiben Sie an feedback@fixmycity.de, um die Datei manuell entfernen zu lassen."

type Props = {
  surveyResponseId: number
  surveySessionId: number
  uploadId: number
  uploadTitle: string
  deleteToken: string | undefined
  onDeleted: () => Promise<void> | void
  variant?: "link" | "icon" | "linkWithIcon"
  className?: string
}

export const SurveyDeleteUploadButton = ({
  surveyResponseId,
  surveySessionId,
  uploadId,
  uploadTitle,
  deleteToken,
  onDeleted,
  variant = "linkWithIcon",
  className,
}: Props) => {
  const [deleteUploadMutation] = useMutation(deleteSurveyUploadPublic)

  const handleDelete = async () => {
    if (!deleteToken) return
    if (
      window.confirm(
        `Möchten Sie das Dokument ${frenchQuote(uploadTitle)} wirklich unwiderruflich löschen?`,
      )
    ) {
      try {
        await deleteUploadMutation({
          id: uploadId,
          surveyResponseId,
          surveySessionId,
          deleteToken,
        })
        await onDeleted()
      } catch (error) {
        console.error("Error deleting upload:", error)
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
  }

  const disabledClasses = "cursor-not-allowed opacity-50"

  const variantButton = {
    icon: deleteToken ? (
      <button
        type="button"
        onClick={handleDelete}
        className={clsx(linkStyles, "cursor-pointer", className)}
        title="Dokument löschen"
      >
        <TrashIcon className="size-5" />
      </button>
    ) : (
      <Tooltip content={DISABLED_PUBLIC_DELETE_TOOLTIP}>
        <span className="inline-flex">
          <button
            type="button"
            disabled
            className={clsx(linkStyles, disabledClasses, className)}
            aria-label="Dokument löschen (nicht verfügbar)"
          >
            <TrashIcon className="size-5" />
          </button>
        </span>
      </Tooltip>
    ),
    link: deleteToken ? (
      <button
        type="button"
        onClick={handleDelete}
        className={clsx(
          "inline-flex cursor-pointer items-center justify-center gap-1",
          linkStyles,
          className,
        )}
      >
        Dokument löschen
      </button>
    ) : (
      <Tooltip content={DISABLED_PUBLIC_DELETE_TOOLTIP}>
        <span className="inline-flex">
          <button
            type="button"
            disabled
            className={clsx(
              "inline-flex cursor-not-allowed items-center justify-center gap-1 opacity-50",
              linkStyles,
              className,
            )}
          >
            Dokument löschen
          </button>
        </span>
      </Tooltip>
    ),
    linkWithIcon: deleteToken ? (
      <button
        type="button"
        onClick={handleDelete}
        className={clsx(
          "inline-flex cursor-pointer items-center justify-center gap-1",
          linkStyles,
          className,
        )}
      >
        {linkIcons["delete"]}
        Löschen
      </button>
    ) : (
      <Tooltip content={DISABLED_PUBLIC_DELETE_TOOLTIP}>
        <span className="inline-flex">
          <button
            type="button"
            disabled
            className={clsx(
              "inline-flex cursor-not-allowed items-center justify-center gap-1 opacity-50",
              linkStyles,
              className,
            )}
          >
            {linkIcons["delete"]}
            Löschen
          </button>
        </span>
      </Tooltip>
    ),
  }

  return variantButton[variant]
}
