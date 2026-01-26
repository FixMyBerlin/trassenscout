"use client"

import { SummaryField } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/SummaryField"
import { UploadLocationMap } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/map/UploadLocationMap"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { LabeledSelect, LabeledSelectProps, LabeledTextField } from "@/src/core/components/forms"
import { DeleteAndBackLinkFooter } from "@/src/core/components/forms/DeleteAndBackLinkFooter"
import { FORM_ERROR, Form } from "@/src/core/components/forms/Form"
import { Link } from "@/src/core/components/links"
import { blueButtonStyles } from "@/src/core/components/links/styles"
import { shortTitle } from "@/src/core/components/text/titles"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { formatBerlinTime } from "@/src/core/utils/formatBerlinTime"
import { formatFileSize } from "@/src/core/utils/formatFileSize"
import { truncateErrorText } from "@/src/server/luckycloud/_utils/errorTruncation"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import { getFilenameFromS3 } from "@/src/server/uploads/_utils/url"
import copyToLuckyCloud from "@/src/server/uploads/mutations/copyToLuckyCloud"
import endCollaboration from "@/src/server/uploads/mutations/endCollaboration"
import updateUpload from "@/src/server/uploads/mutations/updateUploadWithSubsections"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { UploadSchema } from "@/src/server/uploads/schema"
import { getQueryClient, getQueryKey, useMutation, useQuery } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { clsx } from "clsx"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"
import { DeleteUploadButton } from "./DeleteUploadButton"
import { UploadPreview } from "./UploadPreview"
import { uploadUrl } from "./utils/uploadUrl"

type UploadSubsectionFieldsProps = {
  subsections: Awaited<ReturnType<typeof getSubsections>>["subsections"]
  subsubsections: Awaited<ReturnType<typeof getSubsubsections>>["subsubsections"]
  returnPath: Route
}

const UploadSubsectionFields = ({
  subsections,
  subsubsections,
}: Omit<UploadSubsectionFieldsProps, "returnPath">) => {
  // We use `""` here to signify the "All" case which gets translated to `NULL`
  const subsectionOptions: LabeledSelectProps["options"] = [["", "Übergreifendes Dokument"]]
  subsections.forEach((ss) => {
    subsectionOptions.push([ss.id, `${shortTitle(ss.slug)} – ${ss.start}–${ss.end}`] as [
      number,
      string,
    ])
  })

  // Sort by subsection first, then by subsubsection slug, and include subsection in label
  const subsubsectionOptions: LabeledSelectProps["options"] = subsubsections
    .sort((a, b) => {
      const subsectionCompare = a.subsection.slug.localeCompare(b.subsection.slug)
      if (subsectionCompare !== 0) return subsectionCompare
      return a.slug.localeCompare(b.slug)
    })
    .map(
      (subsubsection) =>
        [
          subsubsection.id,
          `${shortTitle(subsubsection.slug)} (${shortTitle(subsubsection.subsection.slug)})`,
        ] as [number, string],
    )
  subsubsectionOptions.unshift(["", "Keine Angabe"])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <LabeledSelect
        name="subsectionId"
        label="Zuordnung zum Planungsabschnitt"
        options={subsectionOptions}
        optional
      />
      <LabeledSelect
        name="subsubsectionId"
        label="Zuordnung zum Eintrag"
        options={subsubsectionOptions}
        optional
      />
    </div>
  )
}

type Props = {
  upload: PromiseReturnType<typeof getUploadWithRelations>
  returnPath: Route
  returnText: string
}

export const EditUploadForm = ({ upload, returnPath, returnText }: Props) => {
  const router = useRouter()
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [isCopyingToLuckyCloud, setIsCopyingToLuckyCloud] = useState(false)
  const [isEndingCollaboration, setIsEndingCollaboration] = useState(false)
  const projectSlug = useProjectSlug()
  const [{ subsections }] = useQuery(getSubsections, { projectSlug })
  const [{ subsubsections }] = useQuery(getSubsubsections, { projectSlug })

  const [updateUploadMutation] = useMutation(updateUpload)
  const [copyToLuckyCloudMutation] = useMutation(copyToLuckyCloud)
  const [endCollaborationMutation] = useMutation(endCollaboration)

  const hasCollaborationUrl = !!upload.collaborationUrl

  // Extract only form-relevant fields for initialValues (form expects array of IDs, not full objects)
  const initialValues: z.infer<typeof UploadSchema> = {
    title: upload.title,
    externalUrl: upload.externalUrl,
    summary: upload.summary,
    subsectionId: upload.subsectionId,
    subsubsectionId: upload.subsubsectionId,
    projectRecordEmailId: upload.projectRecordEmailId,
    mimeType: upload.mimeType,
    latitude: upload.latitude,
    longitude: upload.longitude,
    collaborationUrl: upload.collaborationUrl,
    collaborationPath: upload.collaborationPath,
    projectRecords: upload.projectRecords?.map((pr) => pr.id) ?? [],
  }

  const handleSubmit = async (values: z.infer<typeof UploadSchema>) => {
    try {
      await updateUploadMutation({
        ...values,
        id: upload.id,
        projectSlug,
      })
      router.push(returnPath)
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  const handleCopyToLuckyCloud = async () => {
    setIsCopyingToLuckyCloud(true)
    try {
      await copyToLuckyCloudMutation({ id: upload.id, projectSlug })

      const queryClient = getQueryClient()
      const uploadQueryKey = getQueryKey(getUploadWithRelations, {
        projectSlug,
        id: upload.id,
      })
      await queryClient.invalidateQueries(uploadQueryKey)
      router.refresh()
    } catch (error: any) {
      console.error("Error copying to Luckycloud:", error)
      const errorMessage = error.message || "Unbekannter Fehler"
      alert(`Fehler beim Kopieren zu Luckycloud: ${truncateErrorText(errorMessage)}`)
    } finally {
      setIsCopyingToLuckyCloud(false)
    }
  }

  const handleEndCollaboration = async () => {
    if (
      !window.confirm(
        "Möchten Sie die Kollaboration wirklich beenden? Das Dokument wird archiviert und die Freigaben werden gelöscht.",
      )
    ) {
      return
    }

    setIsEndingCollaboration(true)
    try {
      await endCollaborationMutation({ id: upload.id, projectSlug })
      const queryClient = getQueryClient()
      const uploadQueryKey = getQueryKey(getUploadWithRelations, {
        projectSlug,
        id: upload.id,
      })
      await queryClient.invalidateQueries(uploadQueryKey)
      router.refresh()
    } catch (error: any) {
      console.error("Error ending collaboration:", error)
      const errorMessage = error.message || "Unbekannter Fehler"
      alert(`Fehler beim Beenden der Kollaboration: ${truncateErrorText(errorMessage)}`)
    } finally {
      setIsEndingCollaboration(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 sm:gap-10">
        <div className="flex justify-center sm:block">
          <div className="flex flex-col gap-10 sm:flex-row">
            <UploadPreview
              uploadId={upload.id}
              projectSlug={projectSlug}
              size="grid"
              showTitle={false}
            />
            <div className="flex flex-col gap-1">
              <div>
                <label htmlFor="filename" className="mb-1 block text-sm font-medium text-gray-700">
                  Dateiname
                </label>
                <p className="text-sm text-gray-500">{getFilenameFromS3(upload.externalUrl)}</p>
              </div>

              {upload.fileSize && (
                <div>
                  <label
                    htmlFor="filename"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Größe
                  </label>
                  <p className="text-sm text-gray-500"> {formatFileSize(upload.fileSize)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <Form
          key={`${upload.collaborationUrl}-${upload.collaborationPath}`}
          className="grow"
          submitText="Speichern"
          schema={UploadSchema}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          disabled={isGeneratingSummary}
        >
          <LabeledTextField type="text" name="title" label="Kurzbeschreibung" />
          <SuperAdminBox>
            <div className="space-y-4">
              <LabeledTextField
                type="text"
                name="collaborationUrl"
                label="Kollaborations-URL (Luckycloud)"
                help="Das Dokument bei Luckycloud muss manuell angelegt werden und per URL für alle editierbar sein. Solange eine Kollaborations-URL hinterlegt ist, wird der Original-Upload nicht angezeigt."
              />
              <LabeledTextField
                type="text"
                name="collaborationPath"
                label="Kollaborations-Pfad (Luckycloud)"
                help="Der Pfad zur Datei in Luckycloud."
              />

              <div className="space-y-2">
                {!hasCollaborationUrl && (
                  <button
                    type="button"
                    onClick={handleCopyToLuckyCloud}
                    disabled={isCopyingToLuckyCloud || isEndingCollaboration}
                    className={clsx(
                      "rounded px-4 py-2 text-sm font-medium",
                      blueButtonStyles,
                      "disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                  >
                    {isCopyingToLuckyCloud ? "Wird kopiert..." : "Datei in Luckycloud kopieren"}
                  </button>
                )}
                {hasCollaborationUrl && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleEndCollaboration}
                      disabled={isCopyingToLuckyCloud || isEndingCollaboration}
                      className={clsx(
                        "rounded px-4 py-2 text-sm font-medium",
                        blueButtonStyles,
                        "disabled:cursor-not-allowed disabled:opacity-50",
                      )}
                    >
                      {isEndingCollaboration ? "Wird beendet..." : "Kollaboration beenden"}
                    </button>
                    {upload.collaborationUrl && (
                      <div>
                        <Link href={upload.collaborationUrl} blank>
                          Dokument in Luckycloud öffnen
                        </Link>
                      </div>
                    )}

                    <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                      <p className="font-medium">Hinweis für Administratoren:</p>
                      <p className="mt-1">
                        Die Nachverfolgung von Änderungen muss manuell in Luckycloud aktiviert
                        werden:
                        <br />
                        Dokument → Reiter &quot;Zusammenarbeit&quot; → &quot;Nachverfolgen von
                        Änderungen&quot; → &quot;AKTIVIERT für alle&quot;
                      </p>
                    </div>
                  </div>
                )}
                <div>
                  <Link href={uploadUrl(upload, projectSlug)} blank>
                    Original S3 Datei öffnen
                  </Link>
                </div>
              </div>
            </div>
          </SuperAdminBox>
          <UploadSubsectionFields subsections={subsections} subsubsections={subsubsections} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Standort (optional)
            </label>
            <p className="mb-2 text-sm text-gray-500">
              Dokumente und Bilder lassen sich unabhängig von Planungsabschnitten oder Einträgen auf
              der Karte verorten. <br />
              Sobald ein Standort gesetzt ist, erscheint das Dokument auf der Karte.
            </p>
            <UploadLocationMap />
          </div>
          {upload.id && (
            <SummaryField
              uploadId={upload.id}
              mimeType={upload.mimeType}
              isGeneratingSummary={isGeneratingSummary}
              setIsGeneratingSummary={setIsGeneratingSummary}
              isAiEnabled={upload.project.aiEnabled}
            />
          )}
        </Form>
      </div>

      {/* Related Project Records */}
      {upload.projectRecords && upload.projectRecords.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Verknüpfte Protokolleinträge</h3>
          <ul className="space-y-2">
            {upload.projectRecords.map((projectRecord) => (
              <li key={projectRecord.id} className="flex items-center gap-2 text-sm">
                <Link href={projectRecordDetailRoute(projectSlug, projectRecord.id)}>
                  {projectRecord.title}
                  {projectRecord.date && (
                    <span className="text-gray-500">
                      {" "}
                      ({formatBerlinTime(projectRecord.date, "dd.MM.yyyy")})
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related Email */}
      {upload.projectRecordEmail && (
        <div className="mt-6">
          <p className="text-sm text-gray-600">
            <strong>Quelle:</strong> E-Mail {upload.projectRecordEmail.subject}
            <span className="text-gray-500">
              {" "}
              ({formatBerlinTime(upload.projectRecordEmail.createdAt, "dd.MM.yyyy")})
            </span>
          </p>
        </div>
      )}

      <DeleteAndBackLinkFooter
        fieldName="Upload"
        id={upload.id}
        deleteButton={
          <DeleteUploadButton
            projectSlug={projectSlug}
            uploadId={upload.id}
            uploadTitle={upload.title}
            variant="link"
            onDeleted={() => router.push(returnPath)}
          />
        }
        backHref={returnPath}
        backText={returnText}
      />

      <SuperAdminLogData data={{ upload, subsections, returnPath, returnText }} />
    </>
  )
}
