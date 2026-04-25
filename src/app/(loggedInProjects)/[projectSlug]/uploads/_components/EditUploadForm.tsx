"use client"

import { SummaryField } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/SummaryField"
import { UploadLocationMap } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/map/UploadLocationMap"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import {
  FormDirtyStateReporter,
  LabeledSelect,
  LabeledSelectProps,
  LabeledTextField,
} from "@/src/core/components/forms"
import { BackLink } from "@/src/core/components/forms/BackLink"
import { FORM_ERROR, Form } from "@/src/core/components/forms/Form"
import { shortTitle } from "@/src/core/components/text/titles"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { formatFileSize } from "@/src/core/utils/formatFileSize"
import getAcquisitionAreas from "@/src/server/acquisitionAreas/queries/getAcquisitionAreas"
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
import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
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
  projectSlug: string
  landAcquisitionModuleEnabled: boolean
  subsections: Awaited<ReturnType<typeof getSubsections>>["subsections"]
  subsubsections: Awaited<ReturnType<typeof getSubsubsections>>["subsubsections"]
}

const UploadSubsectionFields = ({
  projectSlug,
  landAcquisitionModuleEnabled,
  subsections,
  subsubsections,
}: UploadSubsectionFieldsProps) => {
  const { watch, setValue } = useFormContext<z.infer<typeof UploadSchema>>()
  const subsectionId = watch("subsectionId")
  const subsubsectionId = watch("subsubsectionId")
  const acquisitionAreaId = watch("acquisitionAreaId")
  const [acquisitionAreas = []] = useQuery(
    getAcquisitionAreas,
    { projectSlug },
    { enabled: landAcquisitionModuleEnabled },
  )

  const selectedSubsectionId = subsectionId ? Number(subsectionId) : null
  const selectedSubsubsectionId = subsubsectionId ? Number(subsubsectionId) : null
  const selectedAcquisitionAreaId = acquisitionAreaId ? Number(acquisitionAreaId) : null

  // We use `""` here to signify the "All" case which gets translated to `NULL`
  const subsectionOptions: LabeledSelectProps["options"] = [["", "Übergreifendes Dokument"]]
  subsections.forEach((ss) => {
    subsectionOptions.push([ss.id, `${shortTitle(ss.slug)}`] as [number, string])
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

  const filteredAcquisitionAreas = acquisitionAreas.filter((acquisitionArea) => {
    if (selectedSubsubsectionId) {
      return acquisitionArea.subsubsectionId === selectedSubsubsectionId
    }
    if (selectedSubsectionId) {
      return acquisitionArea.subsubsection.subsectionId === selectedSubsectionId
    }
    return true
  })

  const acquisitionAreaOptions: LabeledSelectProps["options"] = filteredAcquisitionAreas.map(
    (acquisitionArea) =>
      [
        acquisitionArea.id,
        `${acquisitionArea.id} ${acquisitionArea.parcel.alkisParcelId} (${shortTitle(
          acquisitionArea.subsubsection.slug,
        )}/${shortTitle(acquisitionArea.subsubsection.subsection.slug)})`,
      ] as [number, string],
  )
  acquisitionAreaOptions.unshift(["", "Keine Angabe"])

  const handleSubsectionChange = (newSubsectionId: string) => {
    const nextSubsectionId = newSubsectionId ? Number(newSubsectionId) : null
    const currentSubsubsectionId = subsubsectionId ? Number(subsubsectionId) : null

    if (currentSubsubsectionId) {
      const selectedSubsubsection = subsubsections.find((s) => s.id === currentSubsubsectionId)
      if (selectedSubsubsection && selectedSubsubsection.subsectionId !== nextSubsectionId) {
        setValue("subsubsectionId", null)
      }
    }
  }

  useEffect(() => {
    if (!landAcquisitionModuleEnabled || !selectedAcquisitionAreaId) return
    const stillCompatible = filteredAcquisitionAreas.some(
      (acquisitionArea) => acquisitionArea.id === selectedAcquisitionAreaId,
    )
    if (!stillCompatible) {
      setValue("acquisitionAreaId", null, { shouldDirty: true })
    }
  }, [filteredAcquisitionAreas, landAcquisitionModuleEnabled, selectedAcquisitionAreaId, setValue])

  return (
    <div
      className={
        landAcquisitionModuleEnabled
          ? "grid grid-cols-1 gap-4 sm:grid-cols-3"
          : "grid grid-cols-1 gap-4 sm:grid-cols-2"
      }
    >
      <LabeledSelect
        name="subsectionId"
        label="Zuordnung zum Planungsabschnitt"
        options={subsectionOptions}
        optional
        onChange={handleSubsectionChange}
      />
      <LabeledSelect
        name="subsubsectionId"
        label="Zuordnung zum Eintrag"
        options={subsubsectionOptions}
        optional
      />
      {landAcquisitionModuleEnabled && (
        <LabeledSelect
          name="acquisitionAreaId"
          label="Zuordnung zur Verhandlungsfläche"
          options={acquisitionAreaOptions}
          optional
        />
      )}
    </div>
  )
}

type Props = {
  upload: PromiseReturnType<typeof getUploadWithRelations>
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
  /** Called after a successful save instead of router.push(returnPath). Use router.back() in modal contexts to avoid polluting the history stack. */
  onSuccess?: () => void
  onDirtyChange?: (isDirty: boolean) => void
}

export const EditUploadForm = ({
  upload,
  returnPath,
  returnText,
  showDelete = true,
  onSuccess,
  onDirtyChange,
}: Props) => {
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
    acquisitionAreaId: upload.acquisitionAreaId,
    projectRecordEmailId: upload.projectRecordEmailId,
    mimeType: upload.mimeType,
    latitude: upload.latitude,
    longitude: upload.longitude,
    collaborationUrl: upload.collaborationUrl,
    collaborationPath: upload.collaborationPath,
    surveyResponseId: upload.surveyResponseId,
    projectRecords: upload.projectRecords?.map((pr) => pr.id) ?? [],
  }

  const handleSubmit = async (values: z.infer<typeof UploadSchema>) => {
    try {
      await updateUploadMutation({
        ...values,
        id: upload.id,
        projectSlug,
      })
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(returnPath)
      }
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
            projectSlug={projectSlug}
            landAcquisitionModuleEnabled={upload.project?.landAcquisitionModuleEnabled ?? false}
            subsections={subsections}
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
              Dokumente und Bilder lassen sich unabhängig von Planungsabschnitten oder Einträgen auf
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

      <UploadVerknuepfungen
        className="mt-4"
        projectSlug={projectSlug}
        landAcquisitionModuleEnabled={upload.project?.landAcquisitionModuleEnabled ?? false}
        subsection={upload.subsection}
        subsubsection={upload.Subsubsection}
        acquisitionArea={upload.acquisitionArea}
        projectRecords={upload.projectRecords}
        projectRecordEmail={upload.projectRecordEmail}
        surveyResponse={upload.surveyResponse}
      />

      <SuperAdminLogData data={{ upload, subsections, returnPath, returnText }} />
    </>
  )
}
