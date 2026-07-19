import { Suspense } from "react"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { ProjectPageBreadcrumb } from "@/src/components/core/components/pages/ProjectPageBreadcrumb"
import { Spinner } from "@/src/components/core/components/Spinner"
import { UploadsPageContent } from "@/src/components/uploads/UploadsPageContent"

export function PageUploads() {
  return (
    <>
      <PageHeader
        breadcrumb={<ProjectPageBreadcrumb section="Dokumente" />}
        info="Dokumente und Grafiken hochladen und bei Bedarf verknüpfen."
        title="Dokumente"
      />
      <Suspense fallback={<Spinner page />}>
        <UploadsPageContent />
      </Suspense>
    </>
  )
}
