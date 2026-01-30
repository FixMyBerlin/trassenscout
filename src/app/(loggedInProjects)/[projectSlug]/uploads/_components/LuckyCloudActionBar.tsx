"use client"

import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { blueButtonStyles } from "@/src/core/components/links/styles"
import { truncateErrorText } from "@/src/server/luckycloud/_utils/errorTruncation"
import copyToLuckyCloud from "@/src/server/uploads/mutations/copyToLuckyCloud"
import endCollaboration from "@/src/server/uploads/mutations/endCollaboration"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { getQueryClient, getQueryKey, useMutation } from "@blitzjs/rpc"
import { clsx } from "clsx"
import { useRouter } from "next/navigation"
import { useState } from "react"

type Props = {
  upload: {
    id: number
    collaborationUrl: string | null
    externalUrl: string
  }
  projectSlug: string
}

export const LuckyCloudActionBar = ({ upload, projectSlug }: Props) => {
  const router = useRouter()
  const [isCopyingToLuckyCloud, setIsCopyingToLuckyCloud] = useState(false)
  const [isEndingCollaboration, setIsEndingCollaboration] = useState(false)

  const [copyToLuckyCloudMutation] = useMutation(copyToLuckyCloud)
  const [endCollaborationMutation] = useMutation(endCollaboration)

  const hasCollaborationUrl = !!upload.collaborationUrl

  const handleCopyToLuckyCloud = async () => {
    setIsCopyingToLuckyCloud(true)
    try {
      await copyToLuckyCloudMutation({ id: upload.id, projectSlug })

      const queryClient = getQueryClient()
      const uploadQueryKey = getQueryKey(getUploadWithRelations, {
        projectSlug,
        id: upload.id,
      })
      await queryClient.invalidateQueries(uploadQueryKey)
      router.refresh()
    } catch (error: any) {
      console.error("Error copying to Luckycloud:", error)
      const errorMessage = error.message || "Unbekannter Fehler"
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
      await endCollaborationMutation({ id: upload.id, projectSlug })
      const queryClient = getQueryClient()
      const uploadQueryKey = getQueryKey(getUploadWithRelations, {
        projectSlug,
        id: upload.id,
      })
      await queryClient.invalidateQueries(uploadQueryKey)
      router.refresh()
    } catch (error: any) {
      console.error("Error ending collaboration:", error)
      const errorMessage = error.message || "Unbekannter Fehler"
      alert(`Fehler beim Beenden der Kollaboration: ${truncateErrorText(errorMessage)}`)
    } finally {
      setIsEndingCollaboration(false)
    }
  }

  return (
    <IfUserCanEdit>
      {!hasCollaborationUrl && (
        <button
          type="button"
          onClick={handleCopyToLuckyCloud}
          disabled={isCopyingToLuckyCloud || isEndingCollaboration}
          className={clsx(
            "rounded px-4 py-2 text-sm font-medium",
            blueButtonStyles,
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {isCopyingToLuckyCloud ? "Wird gestartet..." : "Kollaboration starten"}
        </button>
      )}
      {hasCollaborationUrl && (
        <button
          type="button"
          onClick={handleEndCollaboration}
          disabled={isCopyingToLuckyCloud || isEndingCollaboration}
          className={clsx(
            "rounded px-4 py-2 text-sm font-medium",
            blueButtonStyles,
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {isEndingCollaboration ? "Wird beendet..." : "Kollaboration beenden"}
        </button>
      )}
    </IfUserCanEdit>
  )
}
