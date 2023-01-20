import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link, linkStyles } from "src/core/components/links"
import { quote } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import deleteFile from "src/files/mutations/deleteFile"
import getFile from "src/files/queries/getFile"

export const File = () => {
  const router = useRouter()
  const fileId = useParam("fileId", "number")
  const [deleteFileMutation] = useMutation(deleteFile)
  const [file] = useQuery(getFile, { id: fileId })
  const projectSlug = useParam("projectSlug", "string")

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${file.id} unwiderruflich löschen?`)) {
      await deleteFileMutation({ id: file.id })
      await router.push(Routes.ProjectDashboardPage({ projectSlug: projectSlug! }))
    }
  }

  return (
    <>
      <MetaTags noindex title={`File ${quote(file.title)}`} />

      <h1>File {quote(file.title)}</h1>
      <SuperAdminBox>
        <pre>{JSON.stringify(file, null, 2)}</pre>
      </SuperAdminBox>

      <Link href={Routes.EditFilePage({ projectSlug: projectSlug!, fileId: file.id })}>
        Bearbeiten
      </Link>

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "ml-2")}>
        Löschen
      </button>
    </>
  )
}

const ShowFilePage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <File />
      </Suspense>
    </LayoutRs>
  )
}

ShowFilePage.authenticate = true

export default ShowFilePage
