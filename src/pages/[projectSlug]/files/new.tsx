import { BlitzPage, Routes, useParam, useRouterQuery } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense, useState } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Spinner } from "src/core/components/Spinner"
import {
  Link,
  blueButtonStyles,
  selectLinkStyle,
  whiteButtonStyles,
} from "src/core/components/links"
import { ButtonWrapper } from "src/core/components/links/ButtonWrapper"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { quote } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { useS3Upload } from "src/core/lib/next-s3-upload/src"
import createFile from "src/files/mutations/createFile"

const NewFileWithQuery = () => {
  const router = useRouter()
  const [createFileMutation] = useMutation(createFile)
  const projectSlug = useParam("projectSlug", "string")
  const params: { subsubsectionId?: number; returnPath?: string } = useRouterQuery()
  const subsubsectionIdFromParam = params.subsubsectionId || null
  // TODO: As soon as those lines are added, the select-file does not work anymore without an error
  // const [{ sections: sectionsWithSubsections }] = useQuery(getSectionsIncludeSubsections, {
  //   where: { project: { slug: projectSlug! } },
  // })
  // const selectedSubsection = sectionsWithSubsections.find((s) =>
  //   s.subsections.find((ss) => ss.id === subsubsectionIdFromParam)
  // )

  const [fileToUpload, setFileToUpload] = useState<File | null>(null)
  const [subsectionId, setSubsectionId] = useState<number | null>(null)
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

  let handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("foo", event)
    const files = event.target.files as FileList
    if (files[0]) {
      setFileToUpload(files[0])
      setSubsectionId(null) // TODO rework form to allow setting the subsection based on a select box similar to src/files/components/FileForm.tsx
      setUploadState("FILE_SELECTED")
    } else {
      setFileToUpload(null)
      setSubsectionId(null)
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
      subsectionId: subsectionId,
      subsubsectionId: subsubsectionIdFromParam,
    })
    await wait(1000)
    setUploadState("FILE_SAVED")
    let successUrl = Routes.ShowFilePage({
      projectSlug: projectSlug!,
      fileId: file.id,
    })
    if (params.returnPath) {
      const [sectionSlug, subsectionSlug, subsubsectionSlug] = params.returnPath.split("/")
      if (sectionSlug && subsectionSlug && subsubsectionSlug) {
        successUrl = Routes.SubsectionDashboardPage({
          projectSlug: projectSlug!,
          sectionSlug: sectionSlug,
          subsectionPath: [subsectionSlug, subsubsectionSlug],
        })
      }
    }
    await router.push(successUrl)
  }

  const FileSelector = ({ onChange }: { onChange: React.ChangeEventHandler<HTMLInputElement> }) => {
    const fileChoosen = ["FILE_SELECTED"].includes(uploadState)
    return (
      <form>
        <label
          htmlFor="file-upload"
          className={clsx(
            fileChoosen ? selectLinkStyle("white") : selectLinkStyle("blue"),
            "cursor-pointer"
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
        uploadState
      ) && (
        <div className="rounded-lg border px-4 py-2">
          Ausgewählte Datei: <strong>{fileToUpload!.name}</strong>
          <br />{" "}
          {["FILE_UPLOADING", "FILE_ERROR", "FILE_UPLOADED", "FILE_SAVED"].includes(
            uploadState
          ) && (
            <strong>
              Fortschritt: {(files[0]?.progress || 0).toLocaleString("de-DE", { style: "percent" })}
            </strong>
          )}
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

const NewFilePage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutRs>
      <MetaTags noindex title="Neues Dokument" />
      <PageHeader title="Neues Dokument" className="mt-12" />

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
