import { SuperAdminBox } from "@/src/core/components/AdminBox"
import {
  Form,
  FormProps,
  LabeledSelect,
  LabeledSelectProps,
  LabeledTextField,
} from "@/src/core/components/forms"
import { shortTitle } from "@/src/core/components/text/titles"
import { SubsectionWithPosition } from "@/src/server/subsections/queries/getSubsection"
import { useState } from "react"
import { z } from "zod"
import { SummaryField } from "./SummaryField"

export function UploadForm<S extends z.ZodType<any, any>>(
  props: FormProps<S> & {
    subsections: SubsectionWithPosition[]
    isSubsubsectionUpload: boolean
    uploadId?: number
  },
) {
  const { subsections, isSubsubsectionUpload, uploadId, ...formProps } = props
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

  // We use `""` here to signify the "All" case which gets translated to `NULL` in `src/pages/[projectSlug]/uploads/[uploadId]/edit.tsx` and new.
  const options: LabeledSelectProps["options"] = [["", "Übergreifendes Dokument"]]
  subsections.forEach((ss) => {
    options.push([ss.id, `${shortTitle(ss.slug)} – ${ss.start}–${ss.end}`] as [number, string])
  })

  return (
    <Form<S> disabled={isGeneratingSummary} {...formProps}>
      <LabeledTextField type="text" name="title" label="Kurzbeschreibung" />
      {!isSubsubsectionUpload && (
        <LabeledSelect
          name="subsectionId"
          label="Zuordnung zum Planungsabschnitt"
          options={options}
        />
      )}
      <SummaryField
        uploadId={uploadId}
        isGeneratingSummary={isGeneratingSummary}
        setIsGeneratingSummary={setIsGeneratingSummary}
      />
      <SuperAdminBox>
        <LabeledTextField type="text" name="externalUrl" label="Externe Datei-URL" readOnly />
      </SuperAdminBox>
    </Form>
  )
}
