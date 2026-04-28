"use client"

import { EditProjectRecordForm } from "@/src/app/(loggedInProjects)/[projectSlug]/project-records/_components/EditProjectRecordForm"
import { Modal, ModalCloseButton } from "@/src/core/components/Modal"
import { H3 } from "@/src/core/components/text"
import { HeadingWithAction } from "@/src/core/components/text/HeadingWithAction"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { useState } from "react"

export const ProjectRecordEditModalClient = ({
  initialProjectRecord,
}: {
  initialProjectRecord: Awaited<ReturnType<typeof getProjectRecord>>
}) => {
  const router = useRouter()
  const [isDirty, setIsDirty] = useState(false)

  const handleClose = () => {
    if (isDirty && !window.confirm("Ungespeicherte Änderungen verwerfen?")) return
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
          router.replace(
            projectRecordDetailRoute(initialProjectRecord.project.slug, initialProjectRecord.id) as Route,
            { scroll: false },
          )
        }}
      />
    </Modal>
  )
}
