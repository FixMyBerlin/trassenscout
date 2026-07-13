import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { ProjectRecordEmailDetail } from "@/src/components/admin/project-record-emails/ProjectRecordEmailDetail"
import { Spinner } from "@/src/components/core/components/Spinner"

const routeApi = getRouteApi("/admin/project-record-emails/$projectRecordEmailId/")

export function PageAdminProjectRecordEmailsProjectRecordEmailId() {
  const { projectRecordEmailId } = routeApi.useParams()
  return (
    <>
      <AdminPageHeader
        parent={{ title: "Protokoll-Emails", href: "/admin/project-record-emails" }}
        title={`Protokoll-E-Mail ${projectRecordEmailId}`}
      />
      <Suspense fallback={<Spinner page />}>
        <ProjectRecordEmailDetail projectRecordEmailId={Number(projectRecordEmailId)} />
      </Suspense>
    </>
  )
}
