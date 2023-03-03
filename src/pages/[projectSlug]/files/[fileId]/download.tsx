import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { quote } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getFile from "src/files/queries/getFile"

const DownloadFileWithQuery = () => {
  const fileId = useParam("fileId", "number")
  const [file] = useQuery(getFile, { id: fileId, presignUrl: true })
  const url = file.presignedUrl || file.externalUrl

  return (
    <>
      <MetaTags noindex title={`Datei ${quote(file.title)} herunterladen`} />
      <PageHeader title={`${quote(file.title)}`} subtitle="Datei herunterladen" />
      <a href={url}>Download &quot;{file.title}&quot;</a>
    </>
  )
}

const DownloadFilePage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <DownloadFileWithQuery />
      </Suspense>
      <p className="mt-5">
        <Link href={Routes.FilesPage({ projectSlug: projectSlug! })}>Zurück zu Dokumenten</Link>
      </p>
    </LayoutRs>
  )
}

DownloadFilePage.authenticate = true

export default DownloadFilePage
