import { useQuery } from "@blitzjs/rpc"
import {
  Form,
  FormProps,
  LabeledCheckbox,
  LabeledSelect,
  LabeledTextField,
} from "src/core/components/forms"
import getProjects from "src/projects/queries/getProjects"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

export function SurveyForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  const [{ projects }] = useQuery(getProjects, {})
  const projectOptions: [number | string, string][] = [
    ...projects.map((p) => {
      return [p.slug, `${p.slug}`] as [string, string]
    }),
  ]

  return (
    <Form<S> {...props}>
      <LabeledTextField type="text" name="slug" label="Slug" />
      <LabeledTextField type="text" name="title" label="Titel" placeholder="" />
      <LabeledCheckbox value="active" label="Active" scope="active" />
      <LabeledSelect name="projectSlug" label="Projekt" options={projectOptions} />
      <div className="flex gap-4">
        <LabeledTextField
          optional
          type="date"
          name="startDate"
          label="Start-Datum"
          placeholder=""
        />
        <LabeledTextField optional type="date" name="endDate" label="End-Datum" placeholder="" />
      </div>
      <LabeledTextField
        type="number"
        optional
        name="interestedParticipants"
        label="Anzahl der an Updates interessierten Teilnehmenden"
        placeholder=""
      />
    </Form>
  )
}
