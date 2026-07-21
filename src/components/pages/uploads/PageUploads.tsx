import { Suspense } from "react"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { Spinner } from "@/src/components/core/components/Spinner"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { UploadsPageContent } from "@/src/components/uploads/UploadsPageContent"

export function PageUploads() {
  return (
    <>
      <PageHeader
        breadcrumb={<ProjectPageBreadcrumb section="Dokumente" />}
        info="Dokumente und Grafiken hochladen und bei Bedarf verknüpfen."
      />
      <Suspense fallback={<Spinner page />}>
        <UploadsPageContent />
      </Suspense>
    </>
  )
}
