import { UploadPdfViewer } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadPdfViewer"
import { isPdf } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/getFileType"
import { uploadUrl } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/uploadUrl"
import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links"
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
    <UploadPdfViewer
      fileUrl={uploadUrl(upload, projectSlug)}
      layout="fullscreen"
      fit
      toolbar={{
        start: (
          <Link icon="back" href={uploadsListRoute(projectSlug)}>
            Zurück zu den Dokumenten
          </Link>
        ),
        zoom: true,
        rotation: true,
        download: true,
      }}
    />
  )
}
