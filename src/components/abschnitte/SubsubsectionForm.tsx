import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { ReactNode, Suspense, useState } from "react"
import { z } from "zod"
import { LinkWithFormDirtyConfirm } from "@/src/components/abschnitte/LinkWithFormDirtyConfirm"
import { SubsubsectionGeometryInput } from "@/src/components/abschnitte/SubsubsectionGeometryInput"
import { lookupTableRows } from "@/src/components/abschnitte/utils/lookupTableRows"
import { subsubsectionFieldTranslations } from "@/src/components/abschnitte/utils/subsubsectionFieldMappings"
import { FormShell } from "@/src/components/core/components/forms/FormShell"
import { useAppForm } from "@/src/components/core/components/forms/hooks/useAppForm"
import { createFormOptions } from "@/src/components/core/components/forms/utils/createFormOptions"
import {
  applyFormSubmitResult,
  type OnSubmitResult,
} from "@/src/components/core/components/forms/utils/formSubmitResult"
import { Spinner } from "@/src/components/core/components/Spinner"
import { subsubsectionLocationLabelMap } from "@/src/components/core/utils/subsubsectionLocationLabelMap"
import { getUserSelectOptions } from "@/src/components/shared/app/users/utils/getUserSelectOptions"
import { adminLookupRowsWithCountQueryOptions } from "@/src/server/adminLookupTables/adminLookupTablesQueryOptions"
import { projectUsersQueryOptions } from "@/src/server/memberships/projectUsersQueryOptions"
import { subsubsectionFormDefaultValues } from "@/src/shared/subsubsections/schemas"

const loggedInProjectRouteApi = getRouteApi("/_loggedInProjects/$projectSlug")

export type SubsubsectionFormProps<S extends z.ZodTypeAny> = {
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
  subsectionSlug: string
  selectedSubsubsectionSlug?: string
}

function SubsubsectionFormWithQuery<S extends z.ZodTypeAny>({
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
  selectedSubsubsectionSlug,
}: SubsubsectionFormProps<S>) {
  const { projectSlug } = loggedInProjectRouteApi.useParams()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: { ...subsubsectionFormDefaultValues, ...initialValues },
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
  const { data: qualityData } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "qualityLevels" }),
  )
  const qualityLevels = lookupTableRows<{ id: number; title: string; slug: string }>(
    qualityData,
    "qualityLevels",
  )
  const qualityLevelOptions = createFormOptions(
    qualityLevels,
    subsubsectionFieldTranslations.qualityLevelId,
    { optional: true, slugInLabel: true },
  )

  const { data: statusData } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "subsubsectionStatuses" }),
  )
  const subsubsectionStatuss = lookupTableRows<{ id: number; title: string; slug: string }>(
    statusData,
    "subsubsectionStatuss",
  )
  const subsubsectionStatusOptions = createFormOptions(
    subsubsectionStatuss,
    subsubsectionFieldTranslations.subsubsectionStatusId,
    { optional: true, slugInLabel: false },
  )

  const { data: taskData } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "subsubsectionTasks" }),
  )
  const subsubsectionTasks = lookupTableRows<{ id: number; title: string; slug: string }>(
    taskData,
    "subsubsectionTasks",
  )
  const subsubsectionTaskOptions = createFormOptions(
    subsubsectionTasks,
    subsubsectionFieldTranslations.subsubsectionTaskId,
    { optional: true },
  )

  const { data: infraData } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({ projectSlug, table: "subsubsectionInfras" }),
  )
  const subsubsectionInfras = lookupTableRows<{ id: number; title: string; slug: string }>(
    infraData,
    "subsubsectionInfras",
  )
  const subsubsectionInfraOptions = createFormOptions(
    subsubsectionInfras,
    subsubsectionFieldTranslations.subsubsectionInfraId,
    { optional: true, slugInLabel: true },
  )

  const { data: infraTypeData } = useSuspenseQuery(
    adminLookupRowsWithCountQueryOptions({
      projectSlug,
      table: "subsubsectionInfrastructureTypes",
    }),
  )
  const subsubsectionInfrastructureTypes = lookupTableRows<{
    id: number
    title: string
    slug: string
  }>(infraTypeData, "subsubsectionInfrastructureTypes")
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
        <LinkWithFormDirtyConfirm to={`/${projectSlug}/subsubsection-task`} className="py-2">
          Eintragstypen verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
      <SubsubsectionGeometryInput
        projectSlug={projectSlug}
        subsectionSlug={subsectionSlug}
        selectedSubsubsectionSlug={selectedSubsubsectionSlug}
      />
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
          to={`/${projectSlug}/subsubsection-infrastructure-type`}
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
        <LinkWithFormDirtyConfirm to={`/${projectSlug}/quality-levels`} className="py-2">
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
        <LinkWithFormDirtyConfirm to={`/${projectSlug}/subsubsection-infra`} className="py-2">
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
        <LinkWithFormDirtyConfirm to={`/${projectSlug}/subsubsection-status`} className="py-2">
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

export function SubsubsectionForm<S extends z.ZodTypeAny>(props: SubsubsectionFormProps<S>) {
  return (
    <Suspense fallback={<Spinner />}>
      <SubsubsectionFormWithQuery {...props} />
    </Suspense>
  )
}
