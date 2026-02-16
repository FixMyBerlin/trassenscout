"use client"

import { UploadPreviewClickable } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPreviewClickable"
import { ActionBar } from "@/src/core/components/forms/ActionBar"
import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import { Link } from "@/src/core/components/links"
import { shortTitle } from "@/src/core/components/text"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import {
  subsectionDashboardRoute,
  subsubsectionDashboardRoute,
} from "@/src/core/routes/subsectionRoutes"
import deleteProjectRecordWithUploadsDecision from "@/src/server/projectRecords/mutations/deleteProjectRecordWithUploadsDecision"
import getProjectRecordDeleteInfo from "@/src/server/projectRecords/queries/getProjectRecordDeleteInfo"
import { useMutation } from "@blitzjs/rpc"
import { Switch } from "@headlessui/react"
import { ProjectRecordReviewState } from "@prisma/client"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { twJoin } from "tailwind-merge"

type DeleteInfo = Awaited<ReturnType<typeof getProjectRecordDeleteInfo>>

type Props = {
  deleteInfo: DeleteInfo
  projectSlug: string
}

export const DeleteProjectRecordWithUploadsClient = ({ deleteInfo, projectSlug }: Props) => {
  const router = useRouter()
  const [deleteMutation] = useMutation(deleteProjectRecordWithUploadsDecision)

  // Initialize state from server defaultAction
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
      ? (`/${projectSlug}/project-records/needreview` as Route)
      : (`/${projectSlug}/project-records` as Route)

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

      await deleteMutation({
        id: deleteInfo.projectRecord.id,
        projectSlug,
        keepUploadIds,
      })
      router.push(returnPath)
      router.refresh()
    } catch (error) {
      console.error("Error deleting project record:", error)
      alert("Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.")
    }
  }

  const renderProtectionReasons = (upload: DeleteInfo["uploads"][0]) => {
    const reasons: JSX.Element[] = []

    if (upload.displayData?.subsection) {
      const subsection = upload.displayData.subsection
      reasons.push(
        <span key="subsection">
          Planungsabschnitt:{" "}
          <Link href={subsectionDashboardRoute(projectSlug, subsection.slug)}>
            {shortTitle(subsection.slug)}
          </Link>
        </span>,
      )
    }

    if (upload.displayData?.subsubsection) {
      const subsubsection = upload.displayData.subsubsection
      reasons.push(
        <span key="subsubsection">
          Eintrag:{" "}
          <Link
            href={subsubsectionDashboardRoute(
              projectSlug,
              subsubsection.subsectionSlug,
              subsubsection.slug,
            )}
          >
            {subsubsection.slug}
          </Link>
        </span>,
      )
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
              <Link href={projectRecordDetailRoute(projectSlug, pr.id)}>{pr.title}</Link>
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
                  "rounded-lg border-2 p-4",
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
