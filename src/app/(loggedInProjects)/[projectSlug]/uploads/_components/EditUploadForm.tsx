"use client"

import { SummaryField } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/SummaryField"
import { UploadLocationMap } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/map/UploadLocationMap"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import {
  FormDirtyStateReporter,
  LabeledCombobox,
  LabeledTextField,
} from "@/src/core/components/forms"
import { BackLink } from "@/src/core/components/forms/BackLink"
import { FORM_ERROR, Form } from "@/src/core/components/forms/Form"
import { shortTitle } from "@/src/core/components/text/titles"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { formatFileSize } from "@/src/core/utils/formatFileSize"
import getAcquisitionAreas from "@/src/server/acquisitionAreas/queries/getAcquisitionAreas"
import getProjectRecord from "@/src/server/projectRecords/queries/getProjectRecord"
import getProjectRecordsByAcquisitionArea from "@/src/server/projectRecords/queries/getProjectRecordsByAcquisitionArea"
import getProjectRecordsBySubsubsection from "@/src/server/projectRecords/queries/getProjectRecordsBySubsubsection"
import getSubsubsections from "@/src/server/subsubsections/queries/getSubsubsections"
import { getFilenameFromS3 } from "@/src/server/uploads/_utils/url"
import updateUpload from "@/src/server/uploads/mutations/updateUploadWithSubsections"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import getUploadsByAcquisitionArea from "@/src/server/uploads/queries/getUploadsByAcquisitionArea"
import getUploadsWithSubsections from "@/src/server/uploads/queries/getUploadsWithSubsections"
import { UploadFormSchema, UploadSchema } from "@/src/server/uploads/schema"
import { invalidateQuery, useMutation, useQuery } from "@blitzjs/rpc"
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
import { UploadAuthorAndDates } from "./UploadAuthorAndDates"
import { UploadPreview } from "./UploadPreview"
import { UploadVerknuepfungen } from "./UploadVerknuepfungen"

type UploadSubsectionFieldsProps = {
  landAcquisitionModuleEnabled: boolean
  subsubsections: Awaited<ReturnType<typeof getSubsubsections>>["subsubsections"]
  acquisitionAreas: Awaited<ReturnType<typeof getAcquisitionAreas>>
}

const UploadSubsectionFields = ({
  acquisitionAreas,
  landAcquisitionModuleEnabled,
  subsubsections,
}: UploadSubsectionFieldsProps) => {
  // Sort by subsection first, then by subsubsection slug (same order as before)
  const subsubsectionCheckboxItems = [...subsubsections]
    .sort((a, b) => {
      const subsectionCompare = a.subsection.slug.localeCompare(b.subsection.slug)
      if (subsectionCompare !== 0) return subsectionCompare
      return a.slug.localeCompare(b.slug)
    })
    .map((ss) => ({
      value: String(ss.id),
      label: `${shortTitle(ss.slug)} (${shortTitle(ss.subsection.slug)})`,
    }))

  const acquisitionAreaCheckboxItems = [...acquisitionAreas]
    .sort((a, b) => {
      const subsectionCompare = a.subsubsection.subsection.slug.localeCompare(
        b.subsubsection.subsection.slug,
      )
      if (subsectionCompare !== 0) return subsectionCompare
      const subsubCompare = a.subsubsection.slug.localeCompare(b.subsubsection.slug)
      if (subsubCompare !== 0) return subsubCompare
      return a.id - b.id
    })
    .map((acquisitionArea) => ({
      value: String(acquisitionArea.id),
      label: `${acquisitionArea.id} - Flurstücknr. ${acquisitionArea.parcel.alkisParcelId} (${shortTitle(acquisitionArea.subsubsection.slug)})`,
    }))

  return (
    <div className="flex flex-col gap-4">
      <LabeledCombobox
        scope="subsubsections"
        label="Verknüpfung mit Maßnahmen"
        optional
        items={subsubsectionCheckboxItems}
      />
      {landAcquisitionModuleEnabled && (
        <LabeledCombobox
          scope="acquisitionAreas"
          label="Verknüpfungen mit Verhandlungsflächen"
          optional
          items={acquisitionAreaCheckboxItems}
        />
      )}
    </div>
  )
}

type UploadWithRelations = PromiseReturnType<typeof getUploadWithRelations>

type Props = {
  upload: UploadWithRelations
  returnPath: Route
  returnText: string
  /**
   * Controls whether the delete button is shown in the action bar.
   * When false, the delete button is hidden. This is used for uploads related to survey responses,
   * because the relation might come from the original survey response (data)  and we don't want to allow deletion
   * in that case. This is a temporary solution (TBD) - we do not know the exact use cases with
   * uploads in surveys yet.
   */
  showDelete?: boolean
  /** Called after a successful save instead of router.push(returnPath), e.g. for modal-specific navigation. */
  onSuccess?: () => void | Promise<void>
  onDirtyChange?: (isDirty: boolean) => void
  onSubmittingChange?: (isSubmitting: boolean) => void
}

const createUploadFormValues = (upload: UploadWithRelations) => ({
  title: upload.title,
  externalUrl: upload.externalUrl,
  summary: upload.summary,
  subsubsections: upload.subsubsections?.map((s) => String(s.id)) ?? [],
  acquisitionAreas: upload.acquisitionAreas?.map((a) => String(a.id)) ?? [],
  projectRecordEmailId: upload.projectRecordEmailId,
  mimeType: upload.mimeType,
  latitude: upload.latitude,
  longitude: upload.longitude,
  collaborationUrl: upload.collaborationUrl,
  collaborationPath: upload.collaborationPath,
  surveyResponseId: upload.surveyResponseId,
  projectRecords: upload.projectRecords?.map((projectRecord) => projectRecord.id) ?? [],
})

const getUploadFormKey = (upload: UploadWithRelations) => {
  const lastUpdatedAt = upload.updatedAt ?? upload.createdAt
  return `${upload.id}-${lastUpdatedAt.toISOString()}`
}

export const EditUploadForm = ({
  upload,
  returnPath,
  returnText,
  showDelete = true,
  onSuccess,
  onDirtyChange,
  onSubmittingChange,
}: Props) => {
  const router = useRouter()
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const projectSlug = useProjectSlug()
  const [{ subsubsections }] = useQuery(getSubsubsections, { projectSlug })
  const [acquisitionAreasData] = useQuery(getAcquisitionAreas, { projectSlug })
  const [updateUploadMutation] = useMutation(updateUpload)

  const initialValues = createUploadFormValues(upload)
  const formKey = getUploadFormKey(upload)

  const handleSubmit = async (values: z.infer<typeof UploadFormSchema>) => {
    onSubmittingChange?.(true)
    try {
      await updateUploadMutation({
        ...(values as z.infer<typeof UploadSchema>),
        id: upload.id,
        projectSlug,
      })

      const nextProjectRecordIds = Array.isArray(values.projectRecords) ? values.projectRecords : []
      const projectRecordIdsToRefresh = new Set<number>([
        ...(upload.projectRecords?.map((projectRecord) => projectRecord.id) ?? []),
        ...nextProjectRecordIds,
      ])

      await Promise.all([
        invalidateQuery(getUploadWithRelations, { projectSlug, id: upload.id }),
        invalidateQuery(getUploadsWithSubsections),
        invalidateQuery(getUploadsByAcquisitionArea),
        invalidateQuery(getProjectRecordsBySubsubsection),
        invalidateQuery(getProjectRecordsByAcquisitionArea),
        ...Array.from(projectRecordIdsToRefresh).map((projectRecordId) =>
          invalidateQuery(getProjectRecord, { projectSlug, id: projectRecordId }),
        ),
      ])

      if (onSuccess) {
        await onSuccess()
      } else {
        router.push(returnPath)
        router.refresh()
      }
    } catch (error: any) {
      onSubmittingChange?.(false)
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 sm:gap-10">
        <Form
          key={formKey}
          className="grow"
          submitText="Speichern"
          schema={UploadFormSchema}
          // @ts-expect-error m2m fields use string ids in the form (for checkbox `value`),
          initialValues={initialValues}
          onSubmit={handleSubmit}
          disabled={isGeneratingSummary}
          actionBarRight={
            <>
              <LuckyCloudActionBar upload={upload} projectSlug={projectSlug} />
              {showDelete ? (
                <DeleteUploadActionBar
                  projectSlug={projectSlug}
                  uploadId={upload.id}
                  uploadTitle={upload.title}
                  returnPath={returnPath}
                />
              ) : (
                <SuperAdminBox>
                  <DeleteUploadActionBar
                    projectSlug={projectSlug}
                    uploadId={upload.id}
                    uploadTitle={upload.title}
                    returnPath={returnPath}
                  />
                </SuperAdminBox>
              )}
            </>
          }
        >
          <FormDirtyStateReporter onDirtyChange={onDirtyChange} />
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
          <UploadSubsectionFields
            acquisitionAreas={acquisitionAreasData}
            landAcquisitionModuleEnabled={upload.project?.landAcquisitionModuleEnabled ?? false}
            subsubsections={subsubsections}
          />
          {upload.id && (
            <SummaryField
              uploadId={upload.id}
              mimeType={upload.mimeType}
              isGeneratingSummary={isGeneratingSummary}
              setIsGeneratingSummary={setIsGeneratingSummary}
              isAiEnabled={upload.project?.aiEnabled ?? false}
              initialSummary={upload.summary}
            />
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Standort (optional)
            </label>
            <p className="mb-2 text-sm text-gray-500">
              Dokumente und Bilder lassen sich unabhängig von Planungsabschnitten oder Maßnahmen auf
              der Karte verorten. <br />
              Sobald ein Standort gesetzt ist, erscheint das Dokument auf der Karte.
            </p>
            <UploadLocationMap />
          </div>

          <LuckyCloudNotice collaborationUrl={upload.collaborationUrl} mimeType={upload.mimeType} />
        </Form>
      </div>

      <SuperAdminLuckyCloud upload={upload} projectSlug={projectSlug} />
      <BackLink href={returnPath} text={returnText} />

      <UploadAuthorAndDates
        className="mt-4"
        createdBy={upload.createdBy}
        createdAt={upload.createdAt}
        updatedBy={upload.updatedBy ?? undefined}
        updatedAt={upload.updatedAt ?? undefined}
      />
      <h4 className="mt-4 text-sm font-medium">Verknüpfungen:</h4>
      <UploadVerknuepfungen
        projectSlug={projectSlug}
        landAcquisitionModuleEnabled={upload.project?.landAcquisitionModuleEnabled ?? false}
        subsubsections={upload.subsubsections}
        acquisitionAreas={upload.acquisitionAreas}
        projectRecords={upload.projectRecords}
        projectRecordEmail={upload.projectRecordEmail}
        surveyResponse={upload.surveyResponse}
      />

      <SuperAdminLogData data={{ upload, returnPath, returnText }} />
    </>
  )
}
