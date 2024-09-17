import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import {
  Form,
  FormProps,
  LabeledCheckbox,
  LabeledSelect,
  LabeledTextField,
} from "@/src/core/components/forms"
import getProjects from "@/src/projects/queries/getProjects"
import { useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { z } from "zod"
export { FORM_ERROR } from "@/src/core/components/forms"

export function SurveyForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  const [{ projects }] = useQuery(getProjects, {})
  const projectOptions: [number | string, string][] = [
    ...projects.map((p) => {
      return [p.slug, `${p.slug}`] as [string, string]
    }),
  ]

  const router = useRouter()
  const editForm = router.pathname.endsWith("edit")

  return (
    <Form<S> {...props}>
      <SuperAdminLogData data={props} />
      <LabeledTextField type="text" name="slug" label="Slug" />
      <LabeledTextField type="text" name="title" label="Titel" />
      <LabeledCheckbox
        value="active"
        label="Umfrage aktiv?"
        scope="active"
        help="Wenn deaktiviert, zeigt Umfrage-Seite einen generischen Hinweis an, dass die Umfrage nicht aktiv ist."
      />

      {/* projectSlug is only for the new form */}
      {!editForm && <LabeledSelect name="projectSlug" label="Projekt" options={projectOptions} />}

      <div className="flex gap-4">
        <LabeledTextField
          optional
          type="date"
          name="startDate"
          label="Neues Start-Datum"
          help="Reine Anzeige fürs Backend."
        />
        <LabeledTextField
          optional
          type="date"
          name="endDate"
          label="Neus End-Datum"
          help="Reine Anzeige fürs Backend."
        />
      </div>
      <LabeledTextField
        type="text"
        optional
        name="surveyResultsUrl"
        label="Externe Url der Beteiligungsergebnisse"
        help="Bspw. Google Spreadsheet"
      />
      <LabeledTextField
        type="number"
        optional
        name="interestedParticipants"
        label="Anzahl der an Updates interessierten Teilnehmenden"
        help="Workflow: Wenn Beteiligung beendet, dann einmalig die Anzahl der angemeldeten und bestätigten E-Mail-Adressen von Mailjet übernehmen, bspw. https://app.mailjet.com/contacts/lists/show/GQcr"
      />
    </Form>
  )
}
