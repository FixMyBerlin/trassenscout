import { Switch } from "@headlessui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useState, type ReactElement } from "react"
import { twJoin } from "tailwind-merge"
import { ActionBar } from "@/src/components/core/components/forms/ActionBar"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { Link } from "@/src/components/core/components/links/Link"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { UploadPreviewClickable } from "@/src/components/uploads/UploadPreviewClickable"
import { ProjectRecordReviewState } from "@/src/prisma/generated/browser"
import { deleteProjectRecordWithUploadsDecisionFn } from "@/src/server/projectRecords/projectRecords.functions"
import {
  projectRecordsNeedsReviewQueryOptions,
  projectRecordsQueryOptions,
  projectRecordsTabCountsQueryOptions,
} from "@/src/server/projectRecords/projectRecordsQueryOptions"
import type { ProjectRecordDeleteInfo } from "@/src/server/projectRecords/types"

type DeleteInfo = ProjectRecordDeleteInfo

type Props = {
  deleteInfo: DeleteInfo
  projectSlug: string
}

export const DeleteProjectRecordWithUploadsClient = ({ deleteInfo, projectSlug }: Props) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const deleteMutation = useMutation({ mutationFn: deleteProjectRecordWithUploadsDecisionFn })

  const [uploadActions, setUploadActions] = useState<Record<number, "save" | "delete">>(() => {
    const actions: Record<number, "save" | "delete"> = {}
    deleteInfo.uploads.forEach((upload) => {
      actions[upload.id] = upload.defaultAction
    })
    return actions
  })

  const toggleUploadAction = (uploadId: number) => {
    setUploadActions((prev) => ({
      ...prev,
      [uploadId]: prev[uploadId] === "save" ? "delete" : "save",
    }))
  }

  const returnPath =
    deleteInfo.projectRecord.reviewState === ProjectRecordReviewState.NEEDSREVIEW
      ? `/${projectSlug}/project-records/needreview`
      : `/${projectSlug}/project-records`

  const handleSubmit = async () => {
    const deleteUploadIds = Object.entries(uploadActions)
      .filter(([_, action]) => action === "delete")
      .map(([uploadId]) => parseInt(uploadId))

    const deleteUploadsText =
      deleteUploadIds.length > 0 ? ` (und verknüpfte Dokumente: ${deleteUploadIds.join(", ")})` : ""

    if (
      !window.confirm(
        `Möchten Sie den Protokolleintrag${deleteUploadsText} wirklich unwiderruflich löschen?`,
      )
    ) {
      return
    }

    try {
      const keepUploadIds = Object.entries(uploadActions)
        .filter(([_, action]) => action === "save")
        .map(([uploadId]) => parseInt(uploadId))

      await deleteMutation.mutateAsync({
        data: {
          id: deleteInfo.projectRecord.id,
          projectSlug,
          keepUploadIds,
        },
      })
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: projectRecordsQueryOptions({ projectSlug }).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: projectRecordsNeedsReviewQueryOptions({ projectSlug }).queryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: projectRecordsTabCountsQueryOptions({ projectSlug }).queryKey,
        }),
      ])
      navigate({ to: returnPath })
    } catch (error) {
      console.error("Error deleting project record:", error)
      alert("Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.")
    }
  }

  const renderProtectionReasons = (upload: DeleteInfo["uploads"][0]) => {
    const reasons: ReactElement[] = []

    if (upload.displayData?.subsubsections && upload.displayData.subsubsections.length > 0) {
      for (const subsubsection of upload.displayData.subsubsections) {
        reasons.push(
          <span key={`subsubsection-${subsubsection.id}`}>
            Maßnahme :{" "}
            <Link
              to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug"
              params={{
                projectSlug,
                subsectionSlug: subsubsection.subsectionSlug,
                subsubsectionSlug: subsubsection.slug,
              }}
            >
              {shortTitle(subsubsection.slug)}
            </Link>
          </span>,
        )
      }
    }

    if (
      upload.displayData?.otherProjectRecords &&
      upload.displayData.otherProjectRecords.length > 0
    ) {
      reasons.push(
        <span key="otherProjectRecords">
          Protokolleinträge:{" "}
          {upload.displayData.otherProjectRecords.map((pr, idx) => (
            <span key={pr.id}>
              {idx > 0 && ", "}
              <Link
                to="/$projectSlug/project-records/$projectRecordId"
                params={{ projectSlug, projectRecordId: String(pr.id) }}
                resetScroll={false}
              >
                {pr.title}
              </Link>
            </span>
          ))}
        </span>,
      )
    }

    if (upload.protectionReasons.projectRecordEmail) {
      reasons.push(
        <span key="email">E-Mail-Anhang (ID: {upload.protectionReasons.projectRecordEmail})</span>,
      )
    }

    if (reasons.length === 0) {
      return <p className="text-xs text-gray-500">Keine weiteren Verknüpfungen.</p>
    }

    return (
      <div className="mt-2 text-xs text-gray-500">
        <p className="mb-2">Dieses Dokument ist außerdem verknüpft mit: </p>
        <ul className="list-disc pl-4">
          {reasons.map((reason, idx) => (
            <li key={idx}>{reason}</li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
        {deleteInfo.uploads.map((upload) => {
          const action = uploadActions[upload.id]
          const isSave = action === "save"

          return (
            <div key={upload.id}>
              <div
                className={twJoin(
                  "flex items-center justify-center rounded-lg border-2 p-4",
                  isSave ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50",
                )}
              >
                <UploadPreviewClickable
                  uploadId={upload.id}
                  projectSlug={projectSlug}
                  size="grid"
                />
              </div>

              <div className="my-2 flex items-center justify-between gap-3">
                <span
                  className={twJoin(
                    "text-sm font-medium",
                    isSave ? "text-green-700" : "text-red-700",
                  )}
                >
                  {isSave ? "Speichern" : "Löschen"}
                </span>
                <Switch
                  checked={isSave}
                  onChange={() => toggleUploadAction(upload.id)}
                  className={twJoin(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    isSave ? "bg-green-600" : "bg-red-600",
                  )}
                >
                  <span className="sr-only">
                    {isSave ? "Dokument speichern" : "Dokument löschen"}
                  </span>
                  <span
                    className={twJoin(
                      "inline-block size-4 transform rounded-full bg-white transition-transform",
                      isSave ? "translate-x-6" : "translate-x-1",
                    )}
                  />
                </Switch>
              </div>

              {renderProtectionReasons(upload)}
            </div>
          )
        })}
      </div>
      <ActionBar
        right={
          <DeleteActionBar
            itemTitle="Protokolleintrag"
            onClick={handleSubmit}
            returnPath={returnPath}
          />
        }
      />
    </div>
  )
}
