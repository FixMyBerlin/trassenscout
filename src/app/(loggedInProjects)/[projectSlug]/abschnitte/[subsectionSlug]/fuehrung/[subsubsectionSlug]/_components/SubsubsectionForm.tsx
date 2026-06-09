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
import { subsubsectionLocationLabelMap } from "@/src/core/utils/subsubsectionLocationLabelMap"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import getQualityLevelsWithCount from "@/src/server/qualityLevels/queries/getQualityLevelsWithCount"
import getSubsubsectionInfrasWithCount from "@/src/server/subsubsectionInfra/queries/getSubsubsectionInfrasWithCount"
import getSubsubsectionInfrastructureTypesWithCount from "@/src/server/subsubsectionInfrastructureType/queries/getSubsubsectionInfrastructureTypesWithCount"
import getSubsubsectionStatussWithCount from "@/src/server/subsubsectionStatus/queries/getSubsubsectionStatussWithCount"
import getSubsubsectionTasksWithCount from "@/src/server/subsubsectionTask/queries/getSubsubsectionTasksWithCount"
import { subsubsectionFormDefaultValues } from "@/src/server/subsubsections/schema"
import { useQuery } from "@blitzjs/rpc"
import { Route } from "next"
import { ReactNode, Suspense, useState } from "react"
import { z } from "zod"
import { subsubsectionFieldTranslations } from "../_utils/subsubsectionFieldMappings"
import { LinkWithFormDirtyConfirm } from "./LinkWithFormDirtyConfirm"
import { SubsubsectionGeometryInput } from "./SubsubsectionGeometryInput"

export type SubsubsectionFormProps<S extends z.ZodType<any, any>> = {
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

function SubsubsectionFormWithQuery<S extends z.ZodType<any, any>>({
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
}: SubsubsectionFormProps<S>) {
  const projectSlug = useProjectSlug()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...subsubsectionFormDefaultValues, ...initialValues },
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

  const [{ qualityLevels }] = useQuery(
    getQualityLevelsWithCount,
    { projectSlug },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const qualityLevelOptions = createFormOptions(
    qualityLevels,
    subsubsectionFieldTranslations.qualityLevelId,
    { optional: true, slugInLabel: true },
  )

  const [{ subsubsectionStatuss }] = useQuery(
    getSubsubsectionStatussWithCount,
    { projectSlug },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const subsubsectionStatusOptions = createFormOptions(
    subsubsectionStatuss,
    subsubsectionFieldTranslations.subsubsectionStatusId,
    { optional: true, slugInLabel: false },
  )

  const [{ subsubsectionTasks }] = useQuery(
    getSubsubsectionTasksWithCount,
    { projectSlug },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const subsubsectionTaskOptions = createFormOptions(
    subsubsectionTasks,
    subsubsectionFieldTranslations.subsubsectionTaskId,
    { optional: true },
  )

  const [{ subsubsectionInfras }] = useQuery(
    getSubsubsectionInfrasWithCount,
    { projectSlug },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const subsubsectionInfraOptions = createFormOptions(
    subsubsectionInfras,
    subsubsectionFieldTranslations.subsubsectionInfraId,
    { optional: true, slugInLabel: true },
  )

  const [{ subsubsectionInfrastructureTypes }] = useQuery(
    getSubsubsectionInfrastructureTypesWithCount,
    { projectSlug },
    { refetchOnWindowFocus: false, refetchOnReconnect: false },
  )
  const subsubsectionInfrastructureTypeOptions = createFormOptions(
    subsubsectionInfrastructureTypes,
    subsubsectionFieldTranslations.subsubsectionInfrastructureTypeIds,
    { slugInLabel: true },
  )
  const subsubsectionInfrastructureTypeCheckboxItems = subsubsectionInfrastructureTypeOptions.map(
    ([value, label]) => ({
      value: String(value),
      label,
    }),
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
      showFormDebug={showFormDebug}
    >
      <form.AppField name="slug">
        {(field) => (
          <field.TextField
            type="text"
            label={subsubsectionFieldTranslations.slug}
            help="Nachträgliche Änderungen sorgen dafür, dass bisherige URLs (Bookmarks, in E-Mails) nicht mehr funktionieren."
          />
        )}
      </form.AppField>
      <form.AppField name="description">
        {(field) => (
          <field.TextareaField
            label={`${subsubsectionFieldTranslations.description} (Markdown)`}
            optional
          />
        )}
      </form.AppField>
      <div className="flex items-end gap-5">
        <form.AppField name="subsubsectionTaskId">
          {(field) => (
            <field.SelectField
              label={subsubsectionFieldTranslations.subsubsectionTaskId}
              options={subsubsectionTaskOptions}
              outerProps={{ className: "grow" }}
              optional
            />
          )}
        </form.AppField>
        <LinkWithFormDirtyConfirm
          href={`/${projectSlug}/subsubsection-task` as Route}
          className="py-2"
        >
          Eintragstypen verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
      <SubsubsectionGeometryInput />
      <details>
        <summary className="mb-2 cursor-pointer">Anzeige-Optionen für Karten-Label</summary>
        <form.AppField name="labelPos">
          {(field) => (
            <field.RadiobuttonGroup label="" classNameItemWrapper="space-y-6 sm:columns-2 pt-2" />
          )}
        </form.AppField>
      </details>
      <form.AppField name="isExistingInfra">
        {(field) => <field.Checkbox label={subsubsectionFieldTranslations.isExistingInfra} />}
      </form.AppField>
      <form.AppField name="location">
        {(field) => (
          <field.RadiobuttonGroup
            label={subsubsectionFieldTranslations.location}
            items={[
              { value: "URBAN", label: subsubsectionLocationLabelMap.URBAN },
              { value: "RURAL", label: subsubsectionLocationLabelMap.RURAL },
              { value: "", label: "keine Angabe" },
            ]}
            classNameItemWrapper="flex gap-5 space-y-0! items-center"
          />
        )}
      </form.AppField>
      <form.AppField name="lengthM">
        {(field) => (
          <field.TextFieldCalculateLength
            optional
            label={subsubsectionFieldTranslations.lengthM}
            help="Dieser Wert kann manuell eingetragen oder aus den vorhandenen Geometrien berechnet werden."
          />
        )}
      </form.AppField>
      <form.AppField name="width">
        {(field) => (
          <field.NumberField
            inlineLeadingAddon="m"
            step="0.01"
            label={subsubsectionFieldTranslations.width}
            optional
          />
        )}
      </form.AppField>
      <form.AppField name="costEstimate">
        {(field) => (
          <field.NumberField
            inlineLeadingAddon="€"
            label={subsubsectionFieldTranslations.costEstimate}
            optional
          />
        )}
      </form.AppField>
      <div className="flex items-end gap-5">
        <div className="grow">
          <form.AppField name="subsubsectionInfrastructureTypeIds">
            {(field) => (
              <field.CheckboxGroup
                label={subsubsectionFieldTranslations.subsubsectionInfrastructureTypeIds}
                optional
                items={subsubsectionInfrastructureTypeCheckboxItems}
                classNameItemWrapper="grid grid-cols-1 gap-2 md:grid-cols-2"
              />
            )}
          </form.AppField>
        </div>
        <LinkWithFormDirtyConfirm
          href={`/${projectSlug}/subsubsection-infrastructure-type` as Route}
          className="py-2"
        >
          Gegenstände der Förderung verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
      <div className="flex items-end gap-5">
        <form.AppField name="qualityLevelId">
          {(field) => (
            <field.SelectField
              label={subsubsectionFieldTranslations.qualityLevelId}
              optional
              options={qualityLevelOptions}
              outerProps={{ className: "grow" }}
            />
          )}
        </form.AppField>
        <LinkWithFormDirtyConfirm href={`/${projectSlug}/quality-levels` as Route} className="py-2">
          Ausbaustandards verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
      <div className="flex items-end gap-5">
        <form.AppField name="subsubsectionInfraId">
          {(field) => (
            <field.SelectField
              label={subsubsectionFieldTranslations.subsubsectionInfraId}
              options={subsubsectionInfraOptions}
              outerProps={{ className: "grow" }}
            />
          )}
        </form.AppField>
        <LinkWithFormDirtyConfirm
          href={`/${projectSlug}/subsubsection-infra` as Route}
          className="py-2"
        >
          Führungsformen verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
      <div className="flex items-end gap-5">
        <form.AppField name="subsubsectionStatusId">
          {(field) => (
            <field.SelectField
              label={subsubsectionFieldTranslations.subsubsectionStatusId}
              optional
              options={subsubsectionStatusOptions}
              outerProps={{ className: "grow" }}
            />
          )}
        </form.AppField>
        <LinkWithFormDirtyConfirm
          href={`/${projectSlug}/subsubsection-status` as Route}
          className="py-2"
        >
          Phase verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
      <form.AppField name="estimatedConstructionDateString">
        {(field) => (
          <field.TextField
            help="Format: Datum im Format JJJJ, beispielsweise '2026'"
            label={subsubsectionFieldTranslations.estimatedConstructionDateString}
            optional
          />
        )}
      </form.AppField>
      <form.AppField name="managerId">
        {(field) => (
          <field.SelectField
            label={subsubsectionFieldTranslations.managerId}
            optional
            options={getUserSelectOptions(users)}
          />
        )}
      </form.AppField>
      <details>
        <summary className="mb-2 cursor-pointer">Verkehrsbelastung</summary>
        <form.AppField name="maxSpeed">
          {(field) => (
            <field.NumberField
              inlineLeadingAddon="kmh"
              label={subsubsectionFieldTranslations.maxSpeed}
              optional
            />
          )}
        </form.AppField>
        <form.AppField name="trafficLoad">
          {(field) => (
            <field.NumberField
              inlineLeadingAddon="Kfz"
              label={subsubsectionFieldTranslations.trafficLoad}
              optional
            />
          )}
        </form.AppField>
        <form.AppField name="trafficLoadDate">
          {(field) => (
            <field.TextField
              type="date"
              label={subsubsectionFieldTranslations.trafficLoadDate}
              optional
            />
          )}
        </form.AppField>
      </details>
      <details>
        <summary className="mb-2 cursor-pointer">Kostenstruktur</summary>
        <form.AppField name="planningCosts">
          {(field) => (
            <field.NumberField
              inlineLeadingAddon="€"
              label={subsubsectionFieldTranslations.planningCosts}
              optional
            />
          )}
        </form.AppField>
        <form.AppField name="constructionCosts">
          {(field) => (
            <field.NumberField
              inlineLeadingAddon="€"
              label={subsubsectionFieldTranslations.constructionCosts}
              optional
            />
          )}
        </form.AppField>
        <form.AppField name="deliveryCosts">
          {(field) => (
            <field.NumberField
              inlineLeadingAddon="€"
              label={subsubsectionFieldTranslations.deliveryCosts}
              optional
            />
          )}
        </form.AppField>
        <form.AppField name="landAcquisitionCosts">
          {(field) => (
            <field.NumberField
              inlineLeadingAddon="€"
              label={subsubsectionFieldTranslations.landAcquisitionCosts}
              optional
            />
          )}
        </form.AppField>
        <form.AppField name="expensesOfficialOrders">
          {(field) => (
            <field.NumberField
              inlineLeadingAddon="€"
              label={subsubsectionFieldTranslations.expensesOfficialOrders}
              optional
            />
          )}
        </form.AppField>
        <form.AppField name="expensesTechnicalVerification">
          {(field) => (
            <field.NumberField
              inlineLeadingAddon="€"
              label={subsubsectionFieldTranslations.expensesTechnicalVerification}
              optional
            />
          )}
        </form.AppField>
        <form.AppField name="nonEligibleExpenses">
          {(field) => (
            <field.NumberField
              inlineLeadingAddon="€"
              label={subsubsectionFieldTranslations.nonEligibleExpenses}
              optional
            />
          )}
        </form.AppField>
        <form.AppField name="revenuesEconomicIncome">
          {(field) => (
            <field.NumberField
              inlineLeadingAddon="€"
              label={subsubsectionFieldTranslations.revenuesEconomicIncome}
              optional
            />
          )}
        </form.AppField>
        <form.AppField name="contributionsThirdParties">
          {(field) => (
            <field.NumberField
              inlineLeadingAddon="€"
              label={subsubsectionFieldTranslations.contributionsThirdParties}
              optional
            />
          )}
        </form.AppField>
        <form.AppField name="grantsOtherFunding">
          {(field) => (
            <field.NumberField
              inlineLeadingAddon="€"
              label={subsubsectionFieldTranslations.grantsOtherFunding}
              optional
            />
          )}
        </form.AppField>
        <form.AppField name="ownFunds">
          {(field) => (
            <field.NumberField
              inlineLeadingAddon="€"
              label={subsubsectionFieldTranslations.ownFunds}
              optional
            />
          )}
        </form.AppField>
      </details>
      <details>
        <summary className="mb-2 cursor-pointer">Dauer</summary>
        <form.AppField name="planningPeriod">
          {(field) => (
            <field.NumberField
              step={1}
              max={100}
              label={subsubsectionFieldTranslations.planningPeriod}
              optional
            />
          )}
        </form.AppField>
        <form.AppField name="constructionPeriod">
          {(field) => (
            <field.NumberField
              step={1}
              max={100}
              label={subsubsectionFieldTranslations.constructionPeriod}
              optional
            />
          )}
        </form.AppField>
        <form.AppField name="estimatedCompletionDate">
          {(field) => (
            <field.TextField
              type="date"
              label={subsubsectionFieldTranslations.estimatedCompletionDate}
              optional
            />
          )}
        </form.AppField>
      </details>
    </FormShell>
  )
}

export function SubsubsectionForm<S extends z.ZodType<any, any>>(props: SubsubsectionFormProps<S>) {
  return (
    <Suspense fallback={<Spinner />}>
      <SubsubsectionFormWithQuery {...props} />
    </Suspense>
  )
}
