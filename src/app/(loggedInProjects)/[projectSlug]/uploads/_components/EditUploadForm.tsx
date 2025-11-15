"use client"

import { SummaryField } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/SummaryField"
import { UploadLocationMap } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/map/UploadLocationMap"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { LabeledSelect, LabeledSelectProps, LabeledTextField } from "@/src/core/components/forms"
import { FORM_ERROR, Form } from "@/src/core/components/forms/Form"
import { Link } from "@/src/core/components/links"
import { shortTitle } from "@/src/core/components/text/titles"
import { projectRecordDetailRoute } from "@/src/core/routes/projectRecordRoutes"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { formatBerlinTime } from "@/src/core/utils/formatBerlinTime"
import getSubsections from "@/src/server/subsections/queries/getSubsections"
import updateUpload from "@/src/server/uploads/mutations/updateUploadWithSubsections"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { UploadSchema } from "@/src/server/uploads/schema"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { PromiseReturnType } from "blitz"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"
import { DeleteUploadButton } from "./DeleteUploadButton"
import { UploadPreview } from "./UploadPreview"

type Props = {
  upload: PromiseReturnType<typeof getUploadWithRelations>
  returnPath: Route
  returnText: string
}

export const EditUploadForm = ({ upload, returnPath, returnText }: Props) => {
  const router = useRouter()
  const isSubsubsectionUpload = typeof upload.subsubsectionId === "number"
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const projectSlug = useProjectSlug()
  const [{ subsections }] = useQuery(getSubsections, { projectSlug })

  // We use `""` here to signify the "All" case which gets translated to `NULL`
  const options: LabeledSelectProps["options"] = [["", "Übergreifendes Dokument"]]
  subsections.forEach((ss) => {
    options.push([ss.id, `${shortTitle(ss.slug)} – ${ss.start}–${ss.end}`] as [number, string])
  })

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
      <div className="mb-6 flex items-center justify-end">
        <DeleteUploadButton
          projectSlug={projectSlug}
          uploadId={upload.id}
          uploadTitle={upload.title}
          variant="icon"
          onDeleted={() => router.push(returnPath)}
        />
      </div>

      <div className="flex gap-10">
        <UploadPreview
          uploadId={upload.id}
          projectSlug={projectSlug}
          size="grid"
          showTitle={true}
        />
        <Form
          className="grow"
          submitText="Speichern"
          schema={UploadSchema}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          disabled={isGeneratingSummary}
        >
          <LabeledTextField type="text" name="title" label="Kurzbeschreibung" />
          {!isSubsubsectionUpload && (
            <LabeledSelect
              name="subsectionId"
              label="Zuordnung zum Planungsabschnitt"
              options={options}
            />
          )}
          {upload.id && (
            <SummaryField
              uploadId={upload.id}
              mimeType={upload.mimeType}
              isGeneratingSummary={isGeneratingSummary}
              setIsGeneratingSummary={setIsGeneratingSummary}
            />
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Standort (optional)
            </label>
            <UploadLocationMap />
          </div>
          <SuperAdminBox>
            <LabeledTextField type="text" name="externalUrl" label="Externe Datei-URL" readOnly />
            <LabeledTextField type="text" name="mimeType" label="MIME Type" readOnly />
          </SuperAdminBox>
        </Form>
      </div>

      {/* Related Project Records */}
      {upload.projectRecords && upload.projectRecords.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">Verknüpfte Projektprotokolle</h3>
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

      <p className="mt-5">
        <Link href={returnPath}>{returnText}</Link>
      </p>

      <SuperAdminLogData data={{ upload, subsections, returnPath, returnText }} />
    </>
  )
}
