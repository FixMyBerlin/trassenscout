import { UploadDetail } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDetail"
import { invoke } from "@/src/blitz-server"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import getUploadWithSubsections from "@/src/server/uploads/queries/getUploadWithSubsections"
import { Metadata } from "next"
import "server-only"

export const metadata: Metadata = {
  title: "Dokument Details",
  robots: {
    index: false,
  },
}

type Props = {
  params: { projectSlug: string; uploadId: string }
  searchParams: { returnPath?: string }
}

export default async function ShowUploadPage({ params, searchParams }: Props) {
  const upload = await invoke(getUploadWithSubsections, {
    projectSlug: params.projectSlug,
    id: Number(params.uploadId),
  })

  return (
    <>
      <PageHeader title="Dokument Details" className="mt-12" />
      <UploadDetail
        upload={upload}
        projectSlug={params.projectSlug}
        returnPath={searchParams.returnPath}
      />
    </>
  )
}
