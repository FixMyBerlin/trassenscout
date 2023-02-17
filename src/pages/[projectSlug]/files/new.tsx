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

  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)

  const handleFileInput = (e: ChangeEventHandler<HTMLInputElement>) => {
    if (e?.target?.files) {
      setSelectedFile(e.target.files[0])
    }
  }

  const uploadFile = async (file) => {
    const bucketParams = {
      Bucket: BUCKET,
      Key: file.name,
      Body: file,
    }

    try {
      await s3Client.send(new PutObjectCommand(bucketParams))
      console.log("uploading file")
      // const command = new PutObjectCommand(bucketParams)
      // const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
      // console.log(
      //   `\nPutting "${bucketParams.Key}" using signedUrl with body "${bucketParams.Body}" in v3`
      // )
      // console.log(signedUrl)
    } catch (err) {
      console.log("Error creating presigned URL", err)
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

      <div>
        <div>Native SDK File Upload Progress is {progress}%</div>
        <input type="file" onChange={handleFileInput} />
        <button
          className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={() => uploadFile(selectedFile)}
        >
          {" "}
          Upload to S3
        </button>
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
