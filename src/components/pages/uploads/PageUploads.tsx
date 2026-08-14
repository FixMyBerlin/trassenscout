import { Suspense } from "react"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { Spinner } from "@/src/components/core/components/Spinner"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { UploadsPageContent } from "@/src/components/uploads/UploadsPageContent"

export function PageUploads() {
  return (
    <>
      <PageHeader
        title="Dokumente"
        titleVisuallyHidden
        breadcrumb={<ProjectPageBreadcrumb section="Dokumente" />}
        info="Unterlagen und Grafiken verwalten, hochladen und direkt mit Maßnahmen verknüpfen."
      />
      <Suspense fallback={<Spinner page />}>
        <UploadsPageContent />
      </Suspense>
    </>
  )
}
