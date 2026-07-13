import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { twJoin } from "tailwind-merge"
import { secondaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import { Tooltip } from "@/src/components/core/components/Tooltip/Tooltip"
import { IfUserCanEdit } from "@/src/components/shared/memberships/IfUserCan"
import {
  canCollaborateInLuckyCloud,
  getCollaborationSupportedExtensions,
} from "@/src/components/uploads/utils/getFileType"
import { truncateErrorText } from "@/src/server/luckycloud/_utils/errorTruncation"
import { uploadQueryOptions } from "@/src/server/uploads/uploadQueryOptions"
import { copyToLuckyCloudFn, endCollaborationFn } from "@/src/server/uploads/uploads.functions"
import type { UploadWithRelations } from "./uploadTypes"

type Props = {
  upload: Pick<UploadWithRelations, "id" | "collaborationUrl" | "externalUrl" | "mimeType">
  projectSlug: string
}

export const LuckyCloudActionBar = ({ upload, projectSlug }: Props) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isCopyingToLuckyCloud, setIsCopyingToLuckyCloud] = useState(false)
  const [isEndingCollaboration, setIsEndingCollaboration] = useState(false)

  const copyToLuckyCloudMutation = useMutation({ mutationFn: copyToLuckyCloudFn })
  const endCollaborationMutation = useMutation({ mutationFn: endCollaborationFn })

  const hasCollaborationUrl = !!upload.collaborationUrl
  const canCollaborate = canCollaborateInLuckyCloud(upload.mimeType)
  const supportedExtensions = getCollaborationSupportedExtensions()
  const tooltipText = !canCollaborate
    ? `Kollaboration nur für Office-Dokumente wie ${supportedExtensions.join(", ")} möglich`
    : undefined

  const invalidateUpload = async () => {
    await queryClient.invalidateQueries({
      queryKey: uploadQueryOptions({ projectSlug, id: upload.id }).queryKey,
    })
    await router.invalidate()
  }

  const handleCopyToLuckyCloud = async () => {
    setIsCopyingToLuckyCloud(true)
    try {
      await copyToLuckyCloudMutation.mutateAsync({ data: { id: upload.id, projectSlug } })
      await invalidateUpload()
    } catch (error: unknown) {
      console.error("Error copying to Luckycloud:", error)
      const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler"
      alert(`Fehler beim Kopieren zu Luckycloud: ${truncateErrorText(errorMessage)}`)
    } finally {
      setIsCopyingToLuckyCloud(false)
    }
  }

  const handleEndCollaboration = async () => {
    if (
      !window.confirm(
        "Möchten Sie die Kollaboration wirklich beenden? Das Dokument wird archiviert und die Freigaben werden gelöscht.",
      )
    ) {
      return
    }

    setIsEndingCollaboration(true)
    try {
      await endCollaborationMutation.mutateAsync({ data: { id: upload.id, projectSlug } })
      await invalidateUpload()
    } catch (error: unknown) {
      console.error("Error ending collaboration:", error)
      const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler"
      alert(`Fehler beim Beenden der Kollaboration: ${truncateErrorText(errorMessage)}`)
    } finally {
      setIsEndingCollaboration(false)
    }
  }

  return (
    <IfUserCanEdit>
      {!hasCollaborationUrl &&
        (tooltipText ? (
          <Tooltip content={tooltipText}>
            <button
              type="button"
              onClick={handleCopyToLuckyCloud}
              disabled={isCopyingToLuckyCloud || isEndingCollaboration || !canCollaborate}
              className={twJoin(
                "rounded px-4 py-2 text-sm font-medium",
                secondaryButtonClassName,
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            >
              {isCopyingToLuckyCloud ? "Wird gestartet..." : "Kollaboration starten"}
            </button>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={handleCopyToLuckyCloud}
            disabled={isCopyingToLuckyCloud || isEndingCollaboration || !canCollaborate}
            className={twJoin(
              "rounded px-4 py-2 text-sm font-medium",
              secondaryButtonClassName,
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {isCopyingToLuckyCloud ? "Wird gestartet..." : "Kollaboration starten"}
          </button>
        ))}
      {hasCollaborationUrl && (
        <button
          type="button"
          onClick={handleEndCollaboration}
          disabled={isCopyingToLuckyCloud || isEndingCollaboration}
          className={twJoin(
            "rounded px-4 py-2 text-sm font-medium",
            secondaryButtonClassName,
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {isEndingCollaboration ? "Wird beendet..." : "Kollaboration beenden"}
        </button>
      )}
    </IfUserCanEdit>
  )
}
