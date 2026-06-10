import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { EditProjectRecordEmailForm } from "@/src/components/admin/project-record-emails/[projectRecordEmailId]/edit/EditProjectRecordEmailForm"
import { Spinner } from "@/src/components/core/components/Spinner"

const routeApi = getRouteApi("/admin/project-record-emails/$projectRecordEmailId/edit/")

export function PageAdminProjectRecordEmailsProjectRecordEmailIdEdit() {
  const { projectRecordEmailId } = routeApi.useParams()
  return (
    <>
      <AdminPageHeader
        parent={{
          title: `Protokoll-E-Mail ${projectRecordEmailId}`,
          href: `/admin/project-record-emails/${projectRecordEmailId}`,
        }}
        title="Bearbeiten"
      />
      <Suspense fallback={<Spinner page />}>
        <EditProjectRecordEmailForm projectRecordEmailId={Number(projectRecordEmailId)} />
      </Suspense>
    </>
  )
}
