import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { ChangeEventHandler, Suspense, useState } from "react"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FileForm, FORM_ERROR } from "src/files/components/FileForm"
import createFile from "src/files/mutations/createFile"
import { FileSchema } from "src/files/schema"
import getProject from "src/projects/queries/getProject"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { s3Client, BUCKET } from "src/core/libs/s3Client"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { useS3Upload } from "next-s3-upload"
import { Notice } from "src/core/components/Notice"

const NewFileWithQuery = () => {
  const router = useRouter()
  const [createFileMutation] = useMutation(createFile)
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug! })

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const file = await createFileMutation({ ...values, projectId: project.id })
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

  let [imageUrl, setImageUrl] = useState()
  let { uploadToS3 } = useS3Upload()

  const [errorUserFeedback, setErrorUserFeedback] = useState("")
  const [successUserFeedback, setSuccessUserFeedback] = useState("")

  let handleFileChange = async (event: Event) => {
    event?.target?.files && setImageUrl(event.target.files[0])
  }
  const uploadFile = async () => {
    if (imageUrl) {
      try {
        let { url } = await uploadToS3(imageUrl)
        setSuccessUserFeedback("Upload erfolgreich.")
      } catch (e: Event) {
        switch (e.message.split(":")[0]) {
          case "Access Denied":
            setErrorUserFeedback("Upload nicht erlaubt.")
            break
        }
      }
    }
  }

  return (
    <>
      <MetaTags noindex title="Neues Dokument" />

      <FileForm
        submitText="Erstellen"
        // TODO schema: See `__ModelIdParam__/edit.tsx` for detailed instruction.
        schema={FileSchema.omit({ projectId: true })}
        // initialValues={{}} // Use only when custom initial values are needed
        onSubmit={handleSubmit}
      />

      <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
        <label
          htmlFor="cover-photo"
          className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
        >
          Datei ablegen
        </label>
        <div className="mt-1 sm:col-span-2 sm:mt-0">
          <div className="flex max-w-lg justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                >
                  <span>Datei hochladen</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">oder drag und drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to ??? MB</p>
            </div>
          </div>
        </div>
        <button
          className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={() => uploadFile()}
        >
          Hochladen
        </button>
        {successUserFeedback && (
          <Notice type={"success"} title={"Erfolgeich"}>
            {successUserFeedback}
          </Notice>
        )}
        {errorUserFeedback && (
          <Notice type={"error"} title={"Fehler"}>
            {errorUserFeedback}
          </Notice>
        )}
      </div>
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
