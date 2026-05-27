import { UploadPdfViewer } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPdfViewer"
import { isPdf } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileType"
import { uploadUrl } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/uploadUrl"
import { invoke } from "@/src/blitz-server"
import { BackLink } from "@/src/core/components/forms/BackLink"
import { blueButtonStylesForLinkElement, Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoIndexTitle } from "@/src/core/components/text"
import { uploadsListRoute } from "@/src/core/routes/uploadRoutes"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { Metadata } from "next"
import { redirect } from "next/navigation"
import "server-only"

export const metadata: Metadata = {
  title: seoIndexTitle("Dokument ansehen"),
  robots: {
    index: false,
  },
}
export const dynamic = "force-dynamic"

type Props = {
  params: { projectSlug: string; uploadId: string }
}

export default async function ViewUploadPage({ params: { projectSlug, uploadId } }: Props) {
  const upload = await invoke(getUploadWithRelations, {
    projectSlug,
    id: Number(uploadId),
  })

  if (!isPdf(upload)) {
    redirect(uploadsListRoute(projectSlug))
  }

  return (
    <>
      <PageHeader title={upload.title} className="mt-12" />

      <div className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen px-4">
        <UploadPdfViewer fileUrl={uploadUrl(upload, projectSlug)} initialZoom={60} />
      </div>
      <div className="mt-6 space-y-4">
        <BackLink href={uploadsListRoute(projectSlug)} text="Zurück zu den Dokumenten" />
        <Link
          blank
          className={blueButtonStylesForLinkElement}
          href={uploadUrl(upload, projectSlug)}
        >
          Datei im Browser öffnen
        </Link>
      </div>
    </>
  )
}
