import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link } from "src/core/components/links"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import { FORM_ERROR, FileForm } from "src/files/components/FileForm"
import updateFile from "src/files/mutations/updateFile"
import getFile from "src/files/queries/getFile"

const EditFile = () => {
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
      await router.push(Routes.ShowFilePage({ projectSlug: projectSlug, fileId: updated.id }))
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title={`File ${file.id} bearbeiten`} />

      <h1>File {file.id} bearbeiten</h1>
      <SuperAdminBox>
        <pre>{JSON.stringify(file, null, 2)}</pre>
      </SuperAdminBox>

      <FileForm
        submitText="Speichern"
        // TODO use a zod schema for form validation
        // 1. Move the schema from mutations/createFile.ts to `File/schema.ts`
        //   - Name `FileSchema`
        // 2. Import the zod schema here.
        // 3. Update the mutations/updateFile.ts to
        //   `const UpdateFileSchema = FileSchema.merge(z.object({id: z.number(),}))`
        // schema={FileSchema}
        initialValues={file}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const EditFilePage = () => {
  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <EditFile />
      </Suspense>
    </LayoutArticle>
  )
}

EditFilePage.authenticate = true

export default EditFilePage
