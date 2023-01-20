import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { quote } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FileForm, FORM_ERROR } from "src/files/components/FileForm"
import updateFile from "src/files/mutations/updateFile"
import getFile from "src/files/queries/getFile"
import { FileSchema } from "src/files/schema"

const EditFileWithQuery = () => {
  const router = useRouter()
  const fileId = useParam("fileId", "number")
  const projectSlug = useParam("projectSlug", "string")
  const [file, { setQueryData }] = useQuery(
    getFile,
    { id: fileId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateFileMutation] = useMutation(updateFile)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateFileMutation({
        id: file.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(Routes.ShowFilePage({ fileId: file.id, projectSlug: projectSlug! }))
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title={`Datei ${quote(file.title)} bearbeiten`} />

      <PageHeader title={`Datei ${quote(file.title)} bearbeiten`} />

      <FileForm
        submitText="Speichern"
        schema={FileSchema}
        initialValues={file}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const EditFilePage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <EditFileWithQuery />
      </Suspense>
      <p className="mt-5">
        <Link href={Routes.FilesPage({ projectSlug: projectSlug! })}>Zurück zur Dateiliste</Link>
      </p>
    </LayoutRs>
  )
}

EditFilePage.authenticate = true

export default EditFilePage
