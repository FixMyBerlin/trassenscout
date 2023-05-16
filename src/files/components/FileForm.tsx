import {
  Form,
  FormProps,
  LabeledSelect,
  LabeledSelectProps,
  LabeledTextField,
} from "src/core/components/forms"
import getSectionsIncludeSubsections from "src/sections/queries/getSectionsIncludeSubsections"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function FileForm<S extends z.ZodType<any, any>>(
  props: FormProps<S> & {
    sectionsWithSubsections: Awaited<ReturnType<typeof getSectionsIncludeSubsections>>["sections"]
  }
) {
  const { sectionsWithSubsections, ...formProps } = props

  // We use `""` here to signify the "All" case which gets translated to `NULL` in `src/pages/[projectSlug]/files/[fileId]/edit.tsx` and new.
  const options: LabeledSelectProps["options"] = [["", "Übergreifendes Dokument"]]
  sectionsWithSubsections.forEach((s) =>
    s.subsections.forEach((ss) => {
      options.push([ss.id, `${s.title}: ${ss.start}–${ss.end}`] as [number, string])
    })
  )

  return (
    <Form<S> {...formProps}>
      <LabeledTextField type="text" name="title" label="Name" placeholder="" />
      <LabeledSelect name="subsectionId" label="Zuordnung zu Teilstrecke" options={options} />
      <LabeledTextField
        type="text"
        name="externalUrl"
        label="Externe Datei-URL"
        readOnly
        placeholder=""
      />
    </Form>
  )
}
