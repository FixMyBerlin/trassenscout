"use client"

import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/core/components/forms/utils/formSubmitResult"
import getProjects from "@/src/server/projects/queries/getProjects"
import { adminSurveyFormDefaultValues } from "@/src/server/surveys/schemas"
import { useQuery } from "@blitzjs/rpc"
import { usePathname } from "next/navigation"
import { ReactNode, useState } from "react"
import { z } from "zod"

export type AdminSurveyFormProps<S extends z.ZodType<any, any>> = {
  schema: S
  initialValues?: Partial<z.infer<S>>
  onSubmit: (values: z.infer<S>) => Promise<void | OnSubmitResult>
  submitText: string
  resetOnSubmit?: boolean
  className?: string
  actionBarLeft?: ReactNode
  actionBarRight?: ReactNode
  submitDisabled?: boolean
  submitClassName?: string
  showFormDebug?: boolean
}

export function AdminSurveyForm<S extends z.ZodType<any, any>>({
  schema,
  initialValues,
  onSubmit,
  submitText,
  resetOnSubmit,
  className,
  actionBarLeft,
  actionBarRight,
  submitDisabled,
  submitClassName,
  showFormDebug,
}: AdminSurveyFormProps<S>) {
  const [formError, setFormError] = useState<string | null>(null)
  const [projects] = useQuery(getProjects, {})
  const projectOptions: [number | string, string][] =
    projects?.projects?.map((p) => [String(p.id), `${p.slug}`] satisfies [string, string]) ?? []

  const pathname = usePathname()
  const editForm = pathname?.endsWith("edit")

  const form = useAppForm({
    defaultValues: { ...adminSurveyFormDefaultValues, ...initialValues },
    validators: { onSubmit: schema } as never,
    onSubmit: async ({ value }) => {
      const result = (await onSubmit(value)) || {}
      applyFormSubmitResult(form, result, setFormError)
      if (resetOnSubmit && !result.FORM_ERROR) {
        form.reset()
        setFormError(null)
      }
    },
  })

  return (
    <FormShell
      form={form}
      formError={formError}
      submitText={submitText}
      className={className}
      actionBarLeft={actionBarLeft}
      actionBarRight={actionBarRight}
      submitDisabled={submitDisabled}
      submitClassName={submitClassName}
      showFormDebug={showFormDebug}
    >
      <SuperAdminLogData data={{ projects }} />
      <form.AppField name="slug">
        {(field) => <field.TextField type="text" label="Slug" />}
      </form.AppField>
      <form.AppField name="title">
        {(field) => <field.TextField type="text" label="Titel" />}
      </form.AppField>
      <form.AppField name="active">
        {(field) => (
          <field.Checkbox
            label="Umfrage aktiv?"
            help="Wenn deaktiviert, zeigt Umfrage-Seite einen generischen Hinweis an, dass die Umfrage nicht aktiv ist."
          />
        )}
      </form.AppField>
      {!editForm && (
        <form.AppField name="projectId">
          {(field) => <field.SelectField label="Projekt" options={projectOptions} />}
        </form.AppField>
      )}
      <div className="flex gap-4">
        <form.AppField name="startDate">
          {(field) => (
            <field.TextField
              optional
              type="date"
              label="Neues Start-Datum"
              help="Reine Anzeige fürs Backend."
            />
          )}
        </form.AppField>
        <form.AppField name="endDate">
          {(field) => (
            <field.TextField
              optional
              type="date"
              label="Neus End-Datum"
              help="Reine Anzeige fürs Backend."
            />
          )}
        </form.AppField>
      </div>
      <form.AppField name="surveyResultsUrl">
        {(field) => (
          <field.TextField
            type="text"
            optional
            label="Externe Url der Beteiligungsergebnisse"
            help="Bspw. Google Spreadsheet"
          />
        )}
      </form.AppField>
      <form.AppField name="interestedParticipants">
        {(field) => (
          <field.NumberField
            optional
            label="Anzahl der an Updates interessierten Teilnehmenden"
            help="Workflow: Wenn Beteiligung beendet, dann einmalig die Anzahl der angemeldeten und bestätigten E-Mail-Adressen von Mailjet übernehmen, bspw. https://app.mailjet.com/contacts/lists/show/GQcr"
          />
        )}
      </form.AppField>
    </FormShell>
  )
}
