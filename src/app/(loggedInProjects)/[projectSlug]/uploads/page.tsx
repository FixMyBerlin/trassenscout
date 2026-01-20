import { UploadsPageContent } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadsPageContent"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { Spinner } from "@/src/core/components/Spinner"
import { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Dokumente",
  robots: {
    index: false,
  },
}

export default async function UploadsPage() {
  return (
    <>
      <PageHeader
        title="Dokumente"
        description="Dokumente und Grafiken hochladen und bei Bedarf verknüpfen."
        className="mt-12"
      />
      <Suspense fallback={<Spinner page />}>
        <UploadsPageContent />
      </Suspense>
    </>
  )
}
