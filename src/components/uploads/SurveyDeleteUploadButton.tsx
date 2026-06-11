import { TrashIcon } from "@heroicons/react/24/outline"
import { useMutation } from "@tanstack/react-query"
import { twJoin } from "tailwind-merge"
import { linkIcons } from "@/src/components/core/components/links/Link"
import { linkStyles } from "@/src/components/core/components/links/styles"
import { frenchQuote } from "@/src/components/core/components/text/quote"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import { deleteSurveyUploadPublicFn } from "@/src/server/uploads/uploads.functions"

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
  const deleteUploadMutation = useMutation({ mutationFn: deleteSurveyUploadPublicFn })

  const handleDelete = async () => {
    if (!deleteToken) return
    if (
      window.confirm(
        `Möchten Sie das Dokument ${frenchQuote(uploadTitle)} wirklich unwiderruflich löschen?`,
      )
    ) {
      try {
        await deleteUploadMutation.mutateAsync({
          data: {
            id: uploadId,
            surveyResponseId,
            surveySessionId,
            deleteToken,
          },
        })
        await onDeleted()
      } catch (error) {
        console.error("Error deleting upload:", error)
        alert("Beim Löschen ist ein Fehler aufgetreten.")
      }
    }
  }

  const disabled = !deleteToken
  const button = (
    <button
      type="button"
      onClick={handleDelete}
      disabled={disabled}
      className={twJoin(
        linkStyles,
        "cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      title="Dokument löschen"
    >
      {variant === "icon" ? (
        <TrashIcon className="size-5" />
      ) : variant === "link" ? (
        "Dokument löschen"
      ) : (
        <>
          {linkIcons["delete"]}
          Löschen
        </>
      )}
    </button>
  )

  if (disabled) {
    return <Tooltip content={DISABLED_PUBLIC_DELETE_TOOLTIP}>{button}</Tooltip>
  }

  return button
}
