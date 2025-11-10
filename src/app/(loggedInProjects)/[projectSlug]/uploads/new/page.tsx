import { NewUploadForm } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/NewUploadForm"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: seoNewTitle("Dokument"),
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string }
  searchParams: { subsubsectionId?: string; returnPath?: string }
}

export default async function NewUploadPage({ params, searchParams }: Props) {
  return (
    <>
      <PageHeader title="Dokument hinzufügen" className="mt-12" />
      <NewUploadForm
        projectSlug={params.projectSlug}
        subsubsectionId={
          searchParams.subsubsectionId ? Number(searchParams.subsubsectionId) : undefined
        }
        returnPath={searchParams.returnPath}
      />
    </>
  )
}
