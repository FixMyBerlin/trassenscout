import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Spinner } from "@/src/core/components/Spinner"
import {
  Link,
  blueButtonStyles,
  selectLinkStyle,
  whiteButtonStyles,
} from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { quote, seoNewTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useS3Upload } from "@/src/core/lib/next-s3-upload/src"
import createUpload from "@/src/uploads/mutations/createUpload"
import { splitReturnTo } from "@/src/uploads/utils"
import { BlitzPage, Routes, useParam, useRouterQuery } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense, useState } from "react"

// Flow: /new goes to /edit on success
// On /edit users can modify the title and section relation
const NewUploadWithQuery = () => {
  const router = useRouter()
  const [createUploadMutation] = useMutation(createUpload)
  const projectSlug = useParam("projectSlug", "string")
  const params: { subsubsectionId?: number; returnPath?: string } = useRouterQuery()
  const subsubsectionIdFromParam = params.subsubsectionId || null

  let backUrl = Routes.UploadsPage({ projectSlug: projectSlug! })
  const { subsectionSlug, subsubsectionSlug } = splitReturnTo(params)
  if (subsectionSlug && subsubsectionSlug) {
    backUrl = Routes.SubsubsectionDashboardPage({
      projectSlug: projectSlug!,
      subsectionSlug: subsectionSlug,
      subsubsectionSlug: subsubsectionSlug,
    })
  }

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
  const { uploadToS3, files } = useS3Upload() // sure

  const handleUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    const file = await createUploadMutation({
      title: fileToUpload!.name,
      externalUrl: url,
      projectSlug: projectSlug!,
      subsectionId: null, // Users can add this in step 2 /edit
      subsubsectionId: subsubsectionIdFromParam,
    })

    await wait(1000)
    setUploadState("FILE_SAVED")
    await router.push(
      Routes.EditUploadPage({
        projectSlug: projectSlug!,
        uploadId: file.id,
        returnPath: params.returnPath,
      }),
    )
  }

  const FileSelector = ({ onChange }: { onChange: React.ChangeEventHandler<HTMLInputElement> }) => {
    const fileChoosen = ["FILE_SELECTED"].includes(uploadState)
    return (
      <form>
        <label
          htmlFor="file-upload"
          className={clsx(
            fileChoosen ? selectLinkStyle("white") : selectLinkStyle("blue"),
            "cursor-pointer",
          )}
        >
          {fileChoosen ? "Andere Datei auswählen" : "Datei auswählen"}
        </label>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          onChange={onChange}
          accept="image/*,.pdf,.docx,.doc,.odt,.xlsx,.ods,.pptx,.odp,.dxp,.dwg"
        />
      </form>
    )
  }

  return (
    <>
      {subsubsectionIdFromParam && (
        <p className="py-5">
          Die Datei wird der Führung mit ID {quote(subsubsectionIdFromParam.toString())} zugeordnet.
        </p>
      )}
      {/* {selectedSubsection && (
        <p>Die Datei wird der Führung {quote(selectedSubsection.title)} zugeordnet.</p>
      )} */}

      {["FILE_SELECTED", "FILE_UPLOADING", "FILE_ERROR", "FILE_UPLOADED", "FILE_SAVED"].includes(
        uploadState,
      ) && (
        <div className="rounded-lg border px-4 py-2">
          Ausgewählte Datei: <strong>{fileToUpload!.name}</strong>
          <br />{" "}
          {["FILE_UPLOADING", "FILE_ERROR", "FILE_UPLOADED", "FILE_SAVED"].includes(
            uploadState,
          ) && <strong>Fortschritt: {(files[0]?.progress || 0).toFixed(1)}%</strong>}
        </div>
      )}
      <ButtonWrapper className="mt-10">
        {["INITIAL", "FILE_SELECTED"].includes(uploadState) && (
          <FileSelector onChange={handleUploadChange} />
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

        {subsubsectionIdFromParam && (
          <Link href={backUrl}>
            {subsubsectionIdFromParam ? "Zurück zur Führung" : "Zurück zu Dokumenten"}
          </Link>
        )}
      </ButtonWrapper>

      <SuperAdminBox className="prose-xs prose">
        <p>
          state: <code>{uploadState}</code>
        </p>
        {["FILE_SELECTED", "FILE_UPLOADING", "FILE_ERROR", "FILE_UPLOADED", "FILE_SAVED"].includes(
          uploadState,
        ) && (
          <p>
            type: <code>{fileToUpload!.type}</code>
            <br />
            size: <code>{fileToUpload!.size}</code>
            <br />
            {["FILE_UPLOADED", "FILE_SAVED"].includes(uploadState) && <>url: {fileUrl || "null"}</>}
          </p>
        )}

        {["FILE_ERROR"].includes(uploadState) && (
          <div className="mt-2 border-2 border-red-500 p-2">
            <code>{uploadError}</code>
          </div>
        )}
      </SuperAdminBox>
    </>
  )
}

const NewUploadPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title={seoNewTitle("Dokument")} />
      <PageHeader title="Dokument hinzufügen" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <NewUploadWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

NewUploadPage.authenticate = true

export default NewUploadPage
