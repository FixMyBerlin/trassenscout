"use client"

import { getUserSelectOptions } from "@/src/app/_components/users/utils/getUserSelectOptions"
import {
  Form,
  FormProps,
  LabeledCheckbox,
  LabeledRadiobuttonGroup,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "@/src/core/components/forms"
import { createFormOptions } from "@/src/core/components/forms/_utils/createFormOptions"
import { LabeledTextFieldCalculateLength } from "@/src/core/components/forms/LabeledTextFieldCalculateLength"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { subsubsectionLocationLabelMap } from "@/src/core/utils/subsubsectionLocationLabelMap"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import getQualityLevelsWithCount from "@/src/server/qualityLevels/queries/getQualityLevelsWithCount"
import getSubsubsectionInfrasWithCount from "@/src/server/subsubsectionInfra/queries/getSubsubsectionInfrasWithCount"
import getSubsubsectionInfrastructureTypesWithCount from "@/src/server/subsubsectionInfrastructureType/queries/getSubsubsectionInfrastructureTypesWithCount"
import getSubsubsectionStatussWithCount from "@/src/server/subsubsectionStatus/queries/getSubsubsectionStatussWithCount"
import getSubsubsectionTasksWithCount from "@/src/server/subsubsectionTask/queries/getSubsubsectionTasksWithCount"
import { useQuery } from "@blitzjs/rpc"
import { Route } from "next"
import { z } from "zod"
import { subsubsectionFieldTranslations } from "../_utils/subsubsectionFieldMappings"
import { LabeledRadiobuttonGroupLabelPos } from "./LabeledRadiobuttonGroupLabelPos"
import { LinkWithFormDirtyConfirm } from "./LinkWithFormDirtyConfirm"
import { SubsubsectionGeometryInput } from "./SubsubsectionGeometryInput"

export function SubsubsectionForm<S extends z.ZodType<any, any>>(
  props: Omit<FormProps<S>, "children">,
) {
  const projectSlug = useProjectSlug()
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
    subsubsectionFieldTranslations.subsubsectionInfrastructureTypeId,
    { optional: true, slugInLabel: true },
  )

  return (
    <Form<S> {...props}>
      {(form) => (
        <>
          <LabeledTextField
            form={form}
            type="text"
            name="slug"
            label={subsubsectionFieldTranslations.slug}
            help="Nachträgliche Änderungen sorgen dafür, dass bisherige URLs (Bookmarks, in E-Mails) nicht mehr funktionieren."
          />
          <LabeledTextareaField
            form={form}
            name="description"
            label={`${subsubsectionFieldTranslations.description} (Markdown)`}
            optional
          />
          <div className="flex items-end gap-5">
            <LabeledSelect
              form={form}
              name="subsubsectionTaskId"
              label={subsubsectionFieldTranslations.subsubsectionTaskId}
              options={subsubsectionTaskOptions}
              outerProps={{ className: "grow" }}
              optional
            />
            <LinkWithFormDirtyConfirm
              form={form}
              href={`/${projectSlug}/subsubsection-task` as Route}
              className="py-2"
            >
              Eintragstypen verwalten…
            </LinkWithFormDirtyConfirm>
          </div>
          <SubsubsectionGeometryInput form={form} />
          <details>
            <summary className="mb-2 cursor-pointer">Anzeige-Optionen für Karten-Label</summary>
            <LabeledRadiobuttonGroupLabelPos form={form} />
          </details>
          <LabeledCheckbox
            form={form}
            scope="isExistingInfra"
            value="true"
            label={subsubsectionFieldTranslations.isExistingInfra}
          />
          <LabeledRadiobuttonGroup
            form={form}
            label={subsubsectionFieldTranslations.location}
            scope="location"
            items={[
              { value: "URBAN", label: subsubsectionLocationLabelMap.URBAN },
              { value: "RURAL", label: subsubsectionLocationLabelMap.RURAL },
              { value: "", label: "keine Angabe" },
            ]}
            classNameItemWrapper="flex gap-5 space-y-0! items-center"
          />
          <LabeledTextFieldCalculateLength
            form={form}
            name="lengthM"
            optional
            label={subsubsectionFieldTranslations.lengthM}
            help="Dieser Wert kann manuell eingetragen oder aus den vorhandenen Geometrien berechnet werden."
          />
          <LabeledTextField
            form={form}
            inlineLeadingAddon="m"
            type="number"
            step="0.01"
            name="width"
            label={subsubsectionFieldTranslations.width}
            optional
          />
          <LabeledTextField
            form={form}
            optional
            name="costEstimate"
            type="number"
            inlineLeadingAddon="€"
            label={subsubsectionFieldTranslations.costEstimate}
          />
          <div className="flex items-end gap-5">
            <LabeledSelect
              form={form}
              name="subsubsectionInfrastructureTypeId"
              label={subsubsectionFieldTranslations.subsubsectionInfrastructureTypeId}
              optional
              options={subsubsectionInfrastructureTypeOptions}
              outerProps={{ className: "grow" }}
            />
            <LinkWithFormDirtyConfirm
              form={form}
              href={`/${projectSlug}/subsubsection-infrastructure-type` as Route}
              className="py-2"
            >
              Fördergegenstand verwalten…
            </LinkWithFormDirtyConfirm>
          </div>
          <div className="flex items-end gap-5">
            <LabeledSelect
              form={form}
              name="qualityLevelId"
              label={subsubsectionFieldTranslations.qualityLevelId}
              optional
              options={qualityLevelOptions}
              outerProps={{ className: "grow" }}
            />
            <LinkWithFormDirtyConfirm
              form={form}
              href={`/${projectSlug}/quality-levels` as Route}
              className="py-2"
            >
              Ausbaustandards verwalten…
            </LinkWithFormDirtyConfirm>
          </div>
          <div className="flex items-end gap-5">
            <LabeledSelect
              form={form}
              name="subsubsectionInfraId"
              label={subsubsectionFieldTranslations.subsubsectionInfraId}
              options={subsubsectionInfraOptions}
              outerProps={{ className: "grow" }}
            />
            <LinkWithFormDirtyConfirm
              form={form}
              href={`/${projectSlug}/subsubsection-infra` as Route}
              className="py-2"
            >
              Führungsformen verwalten…
            </LinkWithFormDirtyConfirm>
          </div>
          <div className="flex items-end gap-5">
            <LabeledSelect
              form={form}
              name="subsubsectionStatusId"
              label={subsubsectionFieldTranslations.subsubsectionStatusId}
              optional
              options={subsubsectionStatusOptions}
              outerProps={{ className: "grow" }}
            />
            <LinkWithFormDirtyConfirm
              form={form}
              href={`/${projectSlug}/subsubsection-status` as Route}
              className="py-2"
            >
              Phase verwalten…
            </LinkWithFormDirtyConfirm>
          </div>
          <LabeledTextField
            form={form}
            help="Format: Datum im Format JJJJ, beispielsweise '2026'"
            name="estimatedConstructionDateString"
            label={subsubsectionFieldTranslations.estimatedConstructionDateString}
            optional
          />
          <LabeledSelect
            form={form}
            name="managerId"
            label={subsubsectionFieldTranslations.managerId}
            optional
            options={getUserSelectOptions(users)}
          />
          <details>
            <summary className="mb-2 cursor-pointer">Verkehrsbelastung</summary>
            <LabeledTextField
              form={form}
              inlineLeadingAddon="kmh"
              type="number"
              name="maxSpeed"
              label={subsubsectionFieldTranslations.maxSpeed}
              optional
            />

            <LabeledTextField
              form={form}
              inlineLeadingAddon="Kfz"
              type="number"
              name="trafficLoad"
              label={subsubsectionFieldTranslations.trafficLoad}
              optional
            />

            <LabeledTextField
              form={form}
              type="date"
              name="trafficLoadDate"
              label={subsubsectionFieldTranslations.trafficLoadDate}
              optional
            />
          </details>
          <details>
            <summary className="mb-2 cursor-pointer">Kostenstruktur</summary>
            <LabeledTextField
              form={form}
              inlineLeadingAddon="€"
              type="number"
              name="planningCosts"
              label={subsubsectionFieldTranslations.planningCosts}
              optional
            />
            <LabeledTextField
              form={form}
              inlineLeadingAddon="€"
              type="number"
              name="constructionCosts"
              label={subsubsectionFieldTranslations.constructionCosts}
              optional
            />
            <LabeledTextField
              form={form}
              inlineLeadingAddon="€"
              type="number"
              name="deliveryCosts"
              label={subsubsectionFieldTranslations.deliveryCosts}
              optional
            />
            <LabeledTextField
              form={form}
              inlineLeadingAddon="€"
              type="number"
              name="landAcquisitionCosts"
              label={subsubsectionFieldTranslations.landAcquisitionCosts}
              optional
            />
            <LabeledTextField
              form={form}
              inlineLeadingAddon="€"
              type="number"
              name="expensesOfficialOrders"
              label={subsubsectionFieldTranslations.expensesOfficialOrders}
              optional
            />
            <LabeledTextField
              form={form}
              inlineLeadingAddon="€"
              type="number"
              name="expensesTechnicalVerification"
              label={subsubsectionFieldTranslations.expensesTechnicalVerification}
              optional
            />
            <LabeledTextField
              form={form}
              inlineLeadingAddon="€"
              type="number"
              name="nonEligibleExpenses"
              label={subsubsectionFieldTranslations.nonEligibleExpenses}
              optional
            />
            <LabeledTextField
              form={form}
              inlineLeadingAddon="€"
              type="number"
              name="revenuesEconomicIncome"
              label={subsubsectionFieldTranslations.revenuesEconomicIncome}
              optional
            />
            <LabeledTextField
              form={form}
              inlineLeadingAddon="€"
              type="number"
              name="contributionsThirdParties"
              label={subsubsectionFieldTranslations.contributionsThirdParties}
              optional
            />
            <LabeledTextField
              form={form}
              inlineLeadingAddon="€"
              type="number"
              name="grantsOtherFunding"
              label={subsubsectionFieldTranslations.grantsOtherFunding}
              optional
            />
            <LabeledTextField
              form={form}
              inlineLeadingAddon="€"
              type="number"
              name="ownFunds"
              label={subsubsectionFieldTranslations.ownFunds}
              optional
            />
          </details>
          <details>
            <summary className="mb-2 cursor-pointer">Dauer</summary>
            <LabeledTextField
              form={form}
              type="number"
              step={1}
              name="planningPeriod"
              label={subsubsectionFieldTranslations.planningPeriod}
              optional
              max={100}
            />
            <LabeledTextField
              form={form}
              type="number"
              step={1}
              name="constructionPeriod"
              label={subsubsectionFieldTranslations.constructionPeriod}
              optional
              max={100}
            />
            <LabeledTextField
              form={form}
              type="date"
              name="estimatedCompletionDate"
              label={subsubsectionFieldTranslations.estimatedCompletionDate}
              optional
            />
          </details>
        </>
      )}
    </Form>
  )
}
