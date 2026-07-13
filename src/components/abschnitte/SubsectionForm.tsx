import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { ReactNode, Suspense, useState } from "react"
import { z } from "zod"
import { LinkWithFormDirtyConfirm } from "@/src/components/abschnitte/LinkWithFormDirtyConfirm"
import { SubsectionGeometryInput } from "@/src/components/abschnitte/SubsectionGeometryInput"
import { getPriorityTranslation } from "@/src/components/abschnitte/utils/getPriorityTranslation"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { createFormOptions } from "@/src/components/core/components/forms/utils/createFormOptions"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { Spinner } from "@/src/components/core/components/Spinner"
import { getUserSelectOptions } from "@/src/components/shared/app/users/utils/getUserSelectOptions"
import { PriorityEnum } from "@/src/prisma/generated/browser"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { projectUsersQueryOptions } from "@/src/server/memberships/projectUsersQueryOptions"
import { subsectionFormDefaultValues } from "@/src/shared/subsections/schemas"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

export type SubsectionFormProps<S extends z.ZodTypeAny> = {
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
  subsectionSlug?: string
}

function SubsectionFormWithQuery<S extends z.ZodTypeAny>({
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
  subsectionSlug,
}: SubsectionFormProps<S>) {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...subsectionFormDefaultValues, ...initialValues },
    validators: { onSubmit: schema } as never,
    onSubmit: async ({ value }) => {
      const result = (await onSubmit(value as z.infer<S>)) || {}
      applyFormSubmitResult(form, result, setFormError)
      if (resetOnSubmit && !result.FORM_ERROR) {
        form.reset()
        setFormError(null)
      }
    },
  })

  const { data: users } = useSuspenseQuery(
    projectUsersQueryOptions({ projectSlug, role: "EDITOR" }),
  )
  const { data: operatorsData } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "operators" }),
  )
  const { data: networkData } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "networkHierarchies" }),
  )
  const { data: statusData } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "subsectionStatuses" }),
  )

  const operators = operatorsData.rows as unknown as Array<{
    id: number
    title: string
    slug: string
  }>
  const networkHierarchys = networkData.rows as unknown as Array<{
    id: number
    title: string
    slug: string
  }>
  const subsectionStatuss = statusData.rows as Array<{
    id: number
    title: string
  }>

  const operatorOptions = createFormOptions(operators, "Baulastträger", {
    optional: true,
    slugInLabel: true,
  })
  const networkOptions = createFormOptions(networkHierarchys, "Netzstufe", {
    optional: true,
    slugInLabel: true,
  })
  const subsectionStatusOptions = createFormOptions(subsectionStatuss, "Status", {
    optional: true,
  })
  const prioritySelectOptions = Object.entries(PriorityEnum).map(
    ([priority, value]) => [priority, getPriorityTranslation(value)] as [string, string],
  )

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
    >
      <form.AppField name="slug">
        {(field) => (
          <field.TextField
            type="text"
            label="Kürzel"
            help="Nachträgliche Änderungen sorgen dafür, dass bisherige URLs (Bookmarks, in E-Mails) nicht mehr funktionieren."
          />
        )}
      </form.AppField>
      <div className="grid grid-cols-2 gap-5">
        <form.AppField name="start">
          {(field) => <field.TextField type="text" label="Startpunkt" />}
        </form.AppField>
        <form.AppField name="end">
          {(field) => <field.TextField type="text" label="Endpunkt" />}
        </form.AppField>
      </div>
      <form.AppField name="description">
        {(field) => <field.TextareaField label="Beschreibung (Markdown)" optional />}
      </form.AppField>
      <SubsectionGeometryInput projectSlug={projectSlug} subsectionSlug={subsectionSlug} />
      <details>
        <summary className="mb-2 cursor-pointer">Anzeige-Optionen für Karten-Label</summary>
        <div className="space-y-6">
          <form.AppField name="labelPos">
            {(field) => <field.RadiobuttonGroup label="" classNameItemWrapper="sm:columns-2" />}
          </form.AppField>
          <form.AppField name="order">
            {(field) => (
              <field.NumberField
                label="Reihenfolge Planungsabschnitte"
                help="Die muss sicherstellen, dass die Geometrien in einer fortlaufenden Linie mit gleicher Linienrichtung dargestellt werden; sie ist auch die Standard-Sortierung."
              />
            )}
          </form.AppField>
        </div>
      </details>
      <form.AppField name="lengthM">
        {(field) => <field.TextFieldCalculateLength label="Länge" optional />}
      </form.AppField>
      <div className="flex items-end gap-5">
        <form.AppField name="operatorId">
          {(field) => (
            <field.SelectField
              label="Baulastträger"
              optional
              options={operatorOptions}
              outerProps={{ className: "grow" }}
            />
          )}
        </form.AppField>
        <LinkWithFormDirtyConfirm to={`/${projectSlug}/operators`} className="py-2">
          Baulastträger verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
      <div className="flex items-end gap-5">
        <form.AppField name="subsectionStatusId">
          {(field) => (
            <field.SelectField
              label="Status"
              optional
              options={subsectionStatusOptions}
              outerProps={{ className: "grow" }}
            />
          )}
        </form.AppField>
        <LinkWithFormDirtyConfirm to={`/${projectSlug}/subsection-status`} className="py-2">
          Status verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
      <form.AppField name="managerId">
        {(field) => (
          <field.SelectField
            label="Projektleiter:in"
            optional
            options={getUserSelectOptions(users)}
          />
        )}
      </form.AppField>
      <form.AppField name="estimatedCompletionDateString">
        {(field) => (
          <field.TextField
            type="text"
            help="Format: Datum im Format JJJJ-MM, beispielsweise '2026-03'; Wert muss in ein Datum umgewandelt werden können."
            label="Jahr und Monat der geplanten Fertigstellung"
            optional
          />
        )}
      </form.AppField>
      <form.AppField name="priority">
        {(field) => (
          <field.SelectField label="Priorität" optional options={prioritySelectOptions} />
        )}
      </form.AppField>
      <div className="flex items-end gap-5">
        <form.AppField name="networkHierarchyId">
          {(field) => (
            <field.SelectField
              label="Netzstufe"
              optional
              options={networkOptions}
              outerProps={{ className: "grow" }}
            />
          )}
        </form.AppField>
        <LinkWithFormDirtyConfirm to={`/${projectSlug}/network-hierarchy`} className="py-2">
          Netzstufen verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
    </FormShell>
  )
}

export function SubsectionForm<S extends z.ZodTypeAny>(props: SubsectionFormProps<S>) {
  return (
    <Suspense fallback={<Spinner />}>
      <SubsectionFormWithQuery {...props} />
    </Suspense>
  )
}
