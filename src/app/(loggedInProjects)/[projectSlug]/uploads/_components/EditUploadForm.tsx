"use client"

import { SummaryField } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/SummaryField"
import { UploadLocationMap } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/map/UploadLocationMap"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { BackLink } from "@/src/core/components/forms/BackLink"
import { LabeledSelect, LabeledSelectProps, LabeledTextField } from "@/src/core/components/forms"
import { BackLink } from "@/src/core/components/forms/BackLink"
import { FORM_ERROR, Form } from "@/src/core/components/forms/Form"
import { Link } from "@/src/core/components/links"
import { shortTitle } from "@/src/core/components/text/titles"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { formatBerlinTime } from "@/src/core/utils/formatBerlinTime"
import { formatFileSize } from "@/src/core/utils/formatFileSize"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import { getFilenameFromS3 } from "@/src/server/uploads/_utils/url"
import updateUpload from "@/src/server/uploads/mutations/updateUploadWithSubsections"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { UploadSchema } from "@/src/server/uploads/schema"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"
import { DeleteUploadActionBar } from "./DeleteUploadActionBar"
import { LuckyCloudActionBar } from "./LuckyCloudActionBar"
import { LuckyCloudDocumentLink } from "./LuckyCloudDocumentLink"
import { LuckyCloudNotice } from "./LuckyCloudNotice"
import { SuperAdminLuckyCloud } from "./SuperAdminLuckyCloud"
import { UploadPreview } from "./UploadPreview"

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
  const projectSlug = useProjectSlug()
  const [{ subsections }] = useQuery(getSubsections, { projectSlug })
  const [{ subsubsections }] = useQuery(getSubsubsections, { projectSlug })

  const [updateUploadMutation] = useMutation(updateUpload)

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

  return (
    <>
      <div className="flex flex-col gap-6 sm:gap-10">
        <Form
          key={`${upload.collaborationUrl}-${upload.collaborationPath}`}
          className="grow"
          submitText="Speichern"
          schema={UploadSchema}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          disabled={isGeneratingSummary}
          actionBarRight={
            <>
              <LuckyCloudActionBar upload={upload} projectSlug={projectSlug} />
              <DeleteUploadActionBar
                projectSlug={projectSlug}
                uploadId={upload.id}
                uploadTitle={upload.title}
                returnPath={returnPath}
              />
            </>
          }
        >
          <div className="flex justify-center sm:block">
            <div className="flex flex-col gap-10 sm:flex-row">
              <UploadPreview
                uploadId={upload.id}
                projectSlug={projectSlug}
                size="grid"
                showTitle={false}
              />
              <div className="grow space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="filename" className="block text-sm font-medium text-gray-700">
                      Dateiname {upload.fileSize && "(Größe)"}
                    </label>{" "}
                    <p className="text-sm text-gray-500">
                      {getFilenameFromS3(upload.externalUrl)}
                      {upload.fileSize && ` (${formatFileSize(upload.fileSize)})`}
                    </p>
                  </div>
                  <LuckyCloudDocumentLink collaborationUrl={upload.collaborationUrl} />
                </div>

                <LabeledTextField type="text" name="title" label="Kurzbeschreibung" />
              </div>
            </div>
          </div>
          <UploadSubsectionFields subsections={subsections} subsubsections={subsubsections} />
          {upload.id && (
            <SummaryField
              uploadId={upload.id}
              mimeType={upload.mimeType}
              isGeneratingSummary={isGeneratingSummary}
              setIsGeneratingSummary={setIsGeneratingSummary}
              isAiEnabled={upload.project.aiEnabled}
              initialSummary={upload.summary}
            />
          )}

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

          <LuckyCloudNotice collaborationUrl={upload.collaborationUrl} />
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

      <SuperAdminLuckyCloud upload={upload} projectSlug={projectSlug} />
      <BackLink href={returnPath} text={returnText} />
      <SuperAdminLogData data={{ upload, subsections, returnPath, returnText }} />
    </>
  )
}
