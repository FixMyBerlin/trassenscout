import { BlitzPage, Routes, useParam, useRouterQuery } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { seoEditTitle } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FileForm, FORM_ERROR } from "src/files/components/FileForm"
import { FilePreview } from "src/files/components/FilePreview"
import updateFile from "src/files/mutations/updateFileWithSubsections"
import getFileWithSubsections from "src/files/queries/getFileWithSubsections"
import { FileSchema } from "src/files/schema"
import { splitReturnTo } from "src/files/utils"
import getSubsections from "src/subsections/queries/getSubsections"

const EditFileWithQuery = () => {
  const router = useRouter()
  const fileId = useParam("fileId", "number")
  const projectSlug = useParam("projectSlug", "string")

  const params: { returnPath?: string } = useRouterQuery()
  let backUrl = Routes.FilesPage({ projectSlug: projectSlug! })
  const { subsectionSlug, subsubsectionSlug } = splitReturnTo(params)
  if (subsectionSlug && subsubsectionSlug) {
    backUrl = Routes.SubsectionDashboardPage({
      projectSlug: projectSlug!,
      subsectionSlug: subsectionSlug,
      subsubsectionSlug: subsubsectionSlug,
    })
  }

  const [file, { setQueryData }] = useQuery(
    getFileWithSubsections,
    { id: fileId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    },
  )
  const [updateFileMutation] = useMutation(updateFile)

  const [{ subsections }] = useQuery(getSubsections, { projectSlug: projectSlug! })

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
      await router.push(backUrl)
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  const isSubsubsectionFile = Boolean(file.subsubsectionId)

  return (
    <>
      <div className="flex gap-10">
        <FilePreview file={file} description={false} />
        <FileForm
          className="grow"
          submitText="Speichern"
          schema={FileSchema}
          initialValues={file}
          onSubmit={handleSubmit}
          subsections={subsections}
          isSubsubsectionFile={isSubsubsectionFile}
        />
      </div>

      <p className="mt-5">
        <Link href={backUrl}>
          {isSubsubsectionFile ? "Zurück zur Führung" : "Zurück zu Dokumenten"}
        </Link>
      </p>

      <SuperAdminLogData data={{ file, subsections }} />
    </>
  )
}

const EditFilePage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutRs>
      <MetaTags noindex title={seoEditTitle("Dokument")} />
      <PageHeader title="Dokument bearbeiten" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <EditFileWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

EditFilePage.authenticate = true

export default EditFilePage
