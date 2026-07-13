import { getRouteApi } from "@tanstack/react-router"
import { Suspense } from "react"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { AdminEditProjectRecordForm } from "@/src/components/admin/project-records/[projectRecordId]/edit/AdminEditProjectRecordForm"
import { Spinner } from "@/src/components/core/components/Spinner"

const routeApi = getRouteApi("/admin/project-records/$projectRecordId/edit/")

export function PageAdminProjectRecordsProjectRecordIdEdit() {
  const { projectRecordId } = routeApi.useParams()
  return (
    <>
      <AdminPageHeader
        parent={{ title: "Protokolleinträge (Review)", href: "/admin/project-records" }}
        title={`Protokolleintrag ${projectRecordId}`}
      />
      <Suspense fallback={<Spinner page />}>
        <AdminEditProjectRecordForm projectRecordId={Number(projectRecordId)} />
      </Suspense>
    </>
  )
}
