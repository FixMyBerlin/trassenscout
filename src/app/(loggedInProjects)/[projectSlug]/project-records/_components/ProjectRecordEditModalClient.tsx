"use client"

import { EditProjectRecordForm } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/EditProjectRecordForm"
import { Modal, ModalCloseButton } from "@/src/core/components/Modal"
import { H3 } from "@/src/core/components/text"
import { HeadingWithAction } from "@/src/core/components/text/HeadingWithAction"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import { Route } from "next"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export const ProjectRecordEditModalClient = ({
  initialProjectRecord,
}: {
  initialProjectRecord: Awaited<ReturnType<typeof getProjectRecord>>
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromParam = searchParams?.get("from")
  const [isDirty, setIsDirty] = useState(false)

  const handleClose = () => {
    if (isDirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return
    if (fromParam && fromParam.startsWith("/") && !fromParam.startsWith("//")) {
      router.replace(fromParam as Route, { scroll: false })
      return
    }
    router.back()
  }

  return (
    <Modal open align="right" handleClose={handleClose} className="space-y-4">
      <HeadingWithAction>
        <H3>Protokolleintrag bearbeiten</H3>
        <ModalCloseButton onClose={handleClose} />
      </HeadingWithAction>

      <EditProjectRecordForm
        initialProjectRecord={initialProjectRecord}
        hideBackLink
        onDirtyChange={setIsDirty}
        onSuccess={() => {
          setIsDirty(false)
          const detailPath = projectRecordDetailRoute(
            initialProjectRecord.project.slug,
            initialProjectRecord.id,
          )
          const appendFrom = fromParam ? `?from=${encodeURIComponent(fromParam)}` : ""
          router.replace(
            `${detailPath}${appendFrom}` as Route,
            { scroll: false },
          )
        }}
      />
    </Modal>
  )
}
