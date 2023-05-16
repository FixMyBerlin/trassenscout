import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense, useState } from "react"
import { blueButtonStyles, Link, whiteButtonStyles } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import createFile from "src/files/mutations/createFile"
import { useS3Upload } from "src/core/lib/next-s3-upload/src"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { useSlugs } from "src/core/hooks"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"

const UploadNewFileWithQuery = () => {
  const router = useRouter()
  const [createFileMutation] = useMutation(createFile)
  const { projectSlug, sectionSlug } = useSlugs()

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
      subsectionId: null,
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

  const FileSelector = ({ onChange }: { onChange: React.ChangeEventHandler<HTMLInputElement> }) => {
    const fileChoosen = ["FILE_SELECTED"].includes(uploadState)
    return (
      <button className={fileChoosen ? whiteButtonStyles : blueButtonStyles}>
        <label htmlFor="file-upload">
          <span>{fileChoosen ? "Andere Datei auswählen" : "Datei auswählen"}</span>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            onChange={onChange}
            accept="image/*,.pdf,.docx,.doc,.odt,.xlsx,.ods,.pptx,.odp,.dxp,.dwg"
          />
        </label>
      </button>
    )
  }

  return (
    <>
      {["FILE_SELECTED", "FILE_UPLOADING", "FILE_ERROR", "FILE_UPLOADED", "FILE_SAVED"].includes(
        uploadState
      ) && (
        <div className="rounded-lg border px-4 py-2">
          Ausgewählte Datei: <strong>{fileToUpload!.name}</strong>
          <br />{" "}
          {["FILE_UPLOADING", "FILE_ERROR", "FILE_UPLOADED", "FILE_SAVED"].includes(
            uploadState
          ) && <strong>Fortschritt: {files[0]?.progress || 0}%</strong>}
        </div>
      )}

      <ButtonWrapper className="mt-10">
        {["INITIAL", "FILE_SELECTED"].includes(uploadState) && (
          <FileSelector onChange={handleFileChange} />
        )}
        {["FILE_SELECTED"].includes(uploadState) && (
          <button className={blueButtonStyles} onClick={() => uploadFile()}>
            Hochladen
          </button>
        )}
        {["FILE_ERROR", "FILE_SAVED"].includes(uploadState) && (
          <button className={whiteButtonStyles} onClick={reset}>
            Reset
          </button>
        )}
      </ButtonWrapper>

      <SuperAdminBox className="prose-xs prose">
        <p>
          state: <code>{uploadState}</code>
        </p>
        <br />
        {["FILE_SELECTED", "FILE_UPLOADING", "FILE_ERROR", "FILE_UPLOADED", "FILE_SAVED"].includes(
          uploadState
        ) && (
          <p>
            name: <code>{fileToUpload!.name}</code>
            <br />
            type: <code>{fileToUpload!.type}</code>
            <br />
            size: <code>{fileToUpload!.size}</code>
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
          </p>
        )}

        {["FILE_ERROR"].includes(uploadState) && (
          <div className="mt-2 border-2 border-red-500 p-2">
            <pre>{uploadError}</pre>
          </div>
        )}
      </SuperAdminBox>
    </>
  )
}

const UploadFilePage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutRs>
      <MetaTags noindex title="Neues Dokument" />
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
