import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FileForm, FORM_ERROR } from "src/files/components/FileForm"
import createFile from "src/files/mutations/createFile"
import { FileSchema } from "src/files/schema"

const NewFileWithQuery = () => {
  const router = useRouter()
  const [createFileMutation] = useMutation(createFile)
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const file = await createFileMutation({ ...values, projectSlug: projectSlug! })
      await router.push(
        Routes.ShowFilePage({
          projectSlug: projectSlug!,
          sectionSlug: sectionSlug!,
          fileId: file.id,
        })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title="Neues Dokument" />

      <FileForm
        submitText="Erstellen"
        // TODO schema: See `__ModelIdParam__/edit.tsx` for detailed instruction.
        schema={FileSchema}
        // initialValues={{}} // Use only when custom initial values are needed
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewFilePage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutRs>
      <PageHeader title="Neues Dokument" />
      <Suspense fallback={<Spinner page />}>
        <NewFileWithQuery />
      </Suspense>
      <p className="mt-5">
        <Link href={Routes.FilesPage({ projectSlug: projectSlug! })}>Zurück zu Dokumenten</Link>
      </p>
    </LayoutRs>
  )
}

NewFilePage.authenticate = true

export default NewFilePage
