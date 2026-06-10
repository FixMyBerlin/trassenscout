import { Suspense } from "react"
import { PageHeader } from "@/src/components/core/components/pages/PageHeader"
import { Spinner } from "@/src/components/core/components/Spinner"
import { UploadsPageContent } from "@/src/components/uploads/UploadsPageContent"

export function PageUploads() {
  return (
    <>
      <PageHeader
        title="Dokumente"
        description="Dokumente und Grafiken hochladen und bei Bedarf verknüpfen."
      />
      <Suspense fallback={<Spinner page />}>
        <UploadsPageContent />
      </Suspense>
    </>
  )
}
