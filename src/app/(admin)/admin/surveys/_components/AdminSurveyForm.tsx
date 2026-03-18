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
      {(form) => (
        <>
          <SuperAdminLogData data={{ projects }} />
          <LabeledTextField form={form} type="text" name="slug" label="Slug" />
          <LabeledTextField form={form} type="text" name="title" label="Titel" />
          <LabeledCheckbox
            form={form}
            label="Umfrage aktiv?"
            scope="active"
            help="Wenn deaktiviert, zeigt Umfrage-Seite einen generischen Hinweis an, dass die Umfrage nicht aktiv ist."
          />

          {!editForm && (
            <LabeledSelect
              form={form}
              name="projectId"
              label="Projekt"
              options={projectOptions ?? []}
            />
          )}

          <div className="flex gap-4">
            <LabeledTextField
              form={form}
              optional
              type="date"
              name="startDate"
              label="Neues Start-Datum"
              help="Reine Anzeige fürs Backend."
            />
            <LabeledTextField
              form={form}
              optional
              type="date"
              name="endDate"
              label="Neus End-Datum"
              help="Reine Anzeige fürs Backend."
            />
          </div>
          <LabeledTextField
            form={form}
            type="text"
            optional
            name="surveyResultsUrl"
            label="Externe Url der Beteiligungsergebnisse"
            help="Bspw. Google Spreadsheet"
          />
          <LabeledTextField
            form={form}
            type="number"
            optional
            name="interestedParticipants"
            label="Anzahl der an Updates interessierten Teilnehmenden"
            help="Workflow: Wenn Beteiligung beendet, dann einmalig die Anzahl der angemeldeten und bestätigten E-Mail-Adressen von Mailjet übernehmen, bspw. https://app.mailjet.com/contacts/lists/show/GQcr"
          />
        </>
      )}
    </Form>
  )
}
