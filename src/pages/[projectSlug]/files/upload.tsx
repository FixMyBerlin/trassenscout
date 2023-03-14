import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense, useState } from "react"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import createFile from "src/files/mutations/createFile"
import { useS3Upload } from "src/core/lib/next-s3-upload/src"

const UploadNewFileWithQuery = () => {
  const router = useRouter()
  const [createFileMutation] = useMutation(createFile)
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")

  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  type FileUploadState =
    | "INITIAL"
    | "FILE_SELECTED"
    | "FILE_UPLOADING"
    | "FILE_ERROR"
    | "FILE_UPLOADED"
    | "FILE_SAVED"
  const [uploadState, setUploadState] = useState<FileUploadState>("INITIAL")
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const { uploadToS3, files } = useS3Upload()

  let handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files as FileList
    if (files[0]) {
      setFileToUpload(files[0])
      setUploadState("FILE_SELECTED")
    } else {
      setFileToUpload(null)
      setUploadState("INITIAL")
    }
  }

  const wait = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))

  const reset = () => {
    setUploadState("INITIAL")
    setFileToUpload(null)
    setUploadError(null)
  }

  const uploadFile = async () => {
    setUploadState("FILE_UPLOADING")
    let url = ""
    try {
      url = (await uploadToS3(fileToUpload!)).url
    } catch (e) {
      if (!(e instanceof Error)) throw e
      setUploadError(e.message)
      setUploadState("FILE_ERROR")
      return
    }
    setUploadState("FILE_UPLOADED")
    setFileUrl(url)
    const file = await createFileMutation({
      title: fileToUpload!.name,
      externalUrl: url,
      projectSlug: projectSlug!,
    })
    setUploadState("FILE_SAVED")
    await wait(1000)
    await router.push(
      Routes.ShowFilePage({
        projectSlug: projectSlug!,
        sectionSlug: sectionSlug!,
        fileId: file.id,
      })
    )
  }

  // @ts-ignore
  const FileSelector = ({ onChange }) => (
    <div className="mt-2 flex text-xl underline">
      <label htmlFor="file-upload">
        <span>Datei auswählen</span>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          onChange={onChange}
        />
      </label>
    </div>
  )

  // @ts-ignore
  const UploadButton = ({ onClick }) => (
    <button className="mt-2 flex text-xl underline" onClick={onClick}>
      Hochladen
    </button>
  )

  return (
    <>
      <MetaTags noindex title="Neue Datei hochladen" />

      <div>
        <div className="border-2 border-blue-200 p-2">
          <code>
            <pre>state: {uploadState}</pre>
            <br />
            {[
              "FILE_SELECTED",
              "FILE_UPLOADING",
              "FILE_ERROR",
              "FILE_UPLOADED",
              "FILE_SAVED",
            ].includes(uploadState) && (
              <pre>
                name: {fileToUpload!.name}
                <br />
                type: {fileToUpload!.type}
                <br />
                size: {fileToUpload!.size}
                <br />
                {["FILE_UPLOADING", "FILE_ERROR", "FILE_UPLOADED", "FILE_SAVED"].includes(
                  uploadState
                ) && (
                  <>
                    progress: {files[0]?.progress || 0}%
                    <br />
                  </>
                )}
                {["FILE_UPLOADED", "FILE_SAVED"].includes(uploadState) && (
                  <>
                    url: {fileUrl || "null"}
                    <br />
                  </>
                )}
              </pre>
            )}
          </code>
        </div>

        {["FILE_ERROR"].includes(uploadState) && (
          <div className="mt-2 border-2 border-red-500 p-2">
            <pre>{uploadError}</pre>
          </div>
        )}

        {["INITIAL", "FILE_SELECTED"].includes(uploadState) && (
          <FileSelector onChange={handleFileChange} />
        )}

        {["FILE_SELECTED"].includes(uploadState) && (
          <button className="mt-2 flex text-xl underline" onClick={() => uploadFile()}>
            Hochladen
          </button>
        )}

        {["FILE_ERROR", "FILE_SAVED"].includes(uploadState) && (
          <button className="mt-2 flex text-xl underline" onClick={reset}>
            Reset
          </button>
        )}
      </div>
    </>
  )
}

const UploadFilePage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutRs>
      <PageHeader title="Neue Datei hochladen" />
      <Suspense fallback={<Spinner page />}>
        <UploadNewFileWithQuery />
      </Suspense>
      <p className="mt-5">
        <Link href={Routes.FilesPage({ projectSlug: projectSlug! })}>Zurück zu Dokumenten</Link>
      </p>
    </LayoutRs>
  )
}

UploadFilePage.authenticate = true

export default UploadFilePage
