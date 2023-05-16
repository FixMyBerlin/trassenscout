import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Link, linkStyles, whiteButtonStyles } from "src/core/components/links"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { quote } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FileTable } from "src/files/components/FileTable"
import deleteFile from "src/files/mutations/deleteFile"
import getFileWithSubsections from "src/files/queries/getFileWithSubsections"

export const File = () => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")
  const fileId = useParam("fileId", "number")
  const [file] = useQuery(getFileWithSubsections, { id: fileId })

  const [deleteFileMutation] = useMutation(deleteFile)
  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${file.id} unwiderruflich löschen?`)) {
      await deleteFileMutation({ id: file.id })
      await router.push(Routes.FilesPage({ projectSlug: projectSlug! }))
    }
  }

  return (
    <>
      <PageHeader title="Dokument Details" className="mt-12" />

      <ButtonWrapper className="mb-10 space-x-4">
        <Link
          button="blue"
          href={Routes.EditFilePage({ projectSlug: projectSlug!, fileId: file.id })}
        >
          Bearbeiten
        </Link>
        <button type="button" onClick={handleDelete} className={whiteButtonStyles}>
          Löschen
        </button>
        <Link href={Routes.FilesPage({ projectSlug: projectSlug! })}>Zurück zu Dokumenten</Link>
      </ButtonWrapper>

      <FileTable withAction={false} files={[file]} />

      <SuperAdminLogData data={file} />
    </>
  )
}

const ShowFilePage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Dokument Details" />

      <Suspense fallback={<Spinner page />}>
        <File />
      </Suspense>
    </LayoutRs>
  )
}

ShowFilePage.authenticate = true

export default ShowFilePage
