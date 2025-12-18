import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import {
  Form,
  FormProps,
  LabeledCheckbox,
  LabeledSelect,
  LabeledTextField,
} from "@/src/core/components/forms"
import getProjects from "@/src/server/projects/queries/getProjects"
import { useQuery } from "@blitzjs/rpc"
import { usePathname } from "next/navigation"
import { z } from "zod"

type Props = FormProps<z.ZodType<any, any>>

export const AdminSurveyForm = (props: Props) => {
  const [projects] = useQuery(getProjects, {})
  const projectOptions: [number | string, string][] = projects?.projects?.map((p) => {
    return [String(p.id), `${p.slug}`] satisfies [string, string]
  })

  const pathname = usePathname()
  const editForm = pathname?.endsWith("edit")

  return (
    <Form {...props}>
      <SuperAdminLogData data={{ projects }} />
      <LabeledTextField type="text" name="slug" label="Slug" />
      <LabeledTextField type="text" name="title" label="Titel" />
      {/* @ts-expect-error the defaults work fine; but the helper should be updated at some point */}
      <LabeledCheckbox
        label="Umfrage aktiv?"
        scope="active"
        help="Wenn deaktiviert, zeigt Umfrage-Seite einen generischen Hinweis an, dass die Umfrage nicht aktiv ist."
      />

      {/* projectSlug is only for the new form */}
      {!editForm && <LabeledSelect name="projectId" label="Projekt" options={projectOptions} />}

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
