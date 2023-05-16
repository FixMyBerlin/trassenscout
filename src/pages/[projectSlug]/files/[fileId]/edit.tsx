import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FileForm, FORM_ERROR } from "src/files/components/FileForm"
import updateFile from "src/files/mutations/updateFileWithSubsections"
import getFileWithSubsections from "src/files/queries/getFileWithSubsections"
import { FileSchema } from "src/files/schema"
import getSectionsIncludeSubsections from "src/sections/queries/getSectionsIncludeSubsections"

const EditFileWithQuery = () => {
  const router = useRouter()
  const fileId = useParam("fileId", "number")
  const projectSlug = useParam("projectSlug", "string")
  const [file, { setQueryData }] = useQuery(
    getFileWithSubsections,
    { id: fileId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateFileMutation] = useMutation(updateFile)

  const [{ sections: sectionsWithSubsections }] = useQuery(getSectionsIncludeSubsections, {
    where: { project: { slug: projectSlug! } },
  })

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateFileMutation({
        id: file.id,
        ...values,
        // We pass in `""` (in `src/files/components/FileForm.tsx`)
        // which gets translated by `z.coerce.number()` to `0`
        // which we use here to overwrite the relation.
        subsectionId: values.subsectionId === 0 ? null : values.subsectionId,
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
      <PageHeader title="Dokument bearbeiten" />

      <FileForm
        submitText="Speichern"
        schema={FileSchema}
        initialValues={file}
        onSubmit={handleSubmit}
        sectionsWithSubsections={sectionsWithSubsections}
      />

      <SuperAdminLogData data={{ file, sectionsWithSubsections }} />
    </>
  )
}

const EditFilePage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutRs>
      <MetaTags noindex title="Dokument bearbeiten" />

      <Suspense fallback={<Spinner page />}>
        <EditFileWithQuery />
      </Suspense>

      <p className="mt-5">
        <Link href={Routes.FilesPage({ projectSlug: projectSlug! })}>Zurück zu Dokumenten</Link>
      </p>
    </LayoutRs>
  )
}

EditFilePage.authenticate = true

export default EditFilePage
