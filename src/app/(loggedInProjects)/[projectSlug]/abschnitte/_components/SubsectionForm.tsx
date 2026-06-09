"use client"

import { getUserSelectOptions } from "@/src/app/_components/users/utils/getUserSelectOptions"
import { Spinner } from "@/src/core/components/Spinner"
import { FormShell } from "@/src/core/components/forms/FormShell"
import { useAppForm } from "@/src/core/components/forms/hooks/useAppForm"
import { createFormOptions } from "@/src/core/components/forms/utils/createFormOptions"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/core/components/forms/utils/formSubmitResult"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import getNetworkHierarchysWithCount from "@/src/server/networkHierarchy/queries/getNetworkHierarchysWithCount"
import getOperatorsWithCount from "@/src/server/operators/queries/getOperatorsWithCount"
import getSubsectionStatussWithCount from "@/src/server/subsectionStatus/queries/getSubsectionStatussWithCount"
import { subsectionFormDefaultValues } from "@/src/server/subsections/schema"
import { useQuery } from "@blitzjs/rpc"
import { PriorityEnum } from "@prisma/client"
import { Route } from "next"
import { ReactNode, Suspense, useState } from "react"
import { z } from "zod"

import { LinkWithFormDirtyConfirm } from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/fuehrung/[subsubsectionSlug]/_components/LinkWithFormDirtyConfirm"
import { getPriorityTranslation } from "../_utils/getPriorityTranslation"
import { SubsectionGeometryInput } from "./SubsectionGeometryInput"

export type SubsectionFormProps<S extends z.ZodType<any, any>> = {
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

function SubsectionFormWithQuery<S extends z.ZodType<any, any>>({
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
}: SubsectionFormProps<S>) {
  const projectSlug = useProjectSlug()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...subsectionFormDefaultValues, ...initialValues },
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

  const [users] = useQuery(
    getProjectUsers,
    { projectSlug, role: "EDITOR" },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  const [{ operators }] = useQuery(
    getOperatorsWithCount,
    { projectSlug },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const operatorOptions = createFormOptions(operators, "Baulastträger", {
    optional: true,
    slugInLabel: true,
  })

  const [{ networkHierarchys }] = useQuery(
    getNetworkHierarchysWithCount,
    { projectSlug },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const networkOptions = createFormOptions(networkHierarchys, "Netzstufe", {
    optional: true,
    slugInLabel: true,
  })

  const prioritySelectOptions = Object.entries(PriorityEnum).map(([priority, value]) => {
    return [priority, getPriorityTranslation(value)] as [string, string]
  })

  const [{ subsectionStatuss }] = useQuery(
    getSubsectionStatussWithCount,
    { projectSlug },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const subsectionStatusOptions = createFormOptions(subsectionStatuss, "Status", { optional: true })

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
      <SubsectionGeometryInput />
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
        <LinkWithFormDirtyConfirm href={`/${projectSlug}/operators` as Route} className="py-2">
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
        <LinkWithFormDirtyConfirm
          href={`/${projectSlug}/subsection-status` as Route}
          className="py-2"
        >
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
        <LinkWithFormDirtyConfirm
          href={`/${projectSlug}/network-hierarchy` as Route}
          className="py-2"
        >
          Netzstufen verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
    </FormShell>
  )
}

export function SubsectionForm<S extends z.ZodType<any, any>>(props: SubsectionFormProps<S>) {
  return (
    <Suspense fallback={<Spinner />}>
      <SubsectionFormWithQuery {...props} />
    </Suspense>
  )
}
