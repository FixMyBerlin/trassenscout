import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense, useState } from "react"
import { blueButtonStyles, Link, whiteButtonStyles } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import createFile from "src/files/mutations/createFile"
import { useS3Upload } from "src/core/lib/next-s3-upload/src"
import { SuperAdminBox } from "src/core/components/AdminBox"

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
    <button className={blueButtonStyles}>
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
    </button>
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
        {["FILE_SELECTED", "FILE_UPLOADING", "FILE_ERROR", "FILE_UPLOADED", "FILE_SAVED"].includes(
          uploadState
        ) && (
          <div className="rounded-lg border px-4 py-2">
            Ausgewählte Datei: {fileToUpload!.name}
            <br />{" "}
            {["FILE_UPLOADING", "FILE_ERROR", "FILE_UPLOADED", "FILE_SAVED"].includes(
              uploadState
            ) && (
              <>
                Fortschritt: {files[0]?.progress || 0}%
                <br />
              </>
            )}
          </div>
        )}

        <SuperAdminBox>
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

          {["FILE_ERROR"].includes(uploadState) && (
            <div className="border-red-500 mt-2 border-2 p-2">
              <pre>{uploadError}</pre>
            </div>
          )}
        </SuperAdminBox>
        <div className="flex flex-col gap-4 sm:flex-row">
          {["INITIAL", "FILE_SELECTED"].includes(uploadState) && (
            <FileSelector onChange={handleFileChange} />
          )}

          {["FILE_SELECTED"].includes(uploadState) && (
            <button className={blueButtonStyles} onClick={() => uploadFile()}>
              Hochladen
            </button>
          )}
        </div>

        {["FILE_ERROR", "FILE_SAVED"].includes(uploadState) && (
          <button className={whiteButtonStyles} onClick={reset}>
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
      <PageHeader title="Neues Dokument" />
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
