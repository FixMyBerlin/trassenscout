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
import { LabeledRadiobuttonGroupLabelPos } from "@/src/pagesComponents/subsubsections/LabeledRadiobuttonGroupLabelPos"
import { subsubsectionFieldTranslations } from "@/src/pagesComponents/subsubsections/subsubsectionFieldMappings"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import getQualityLevelsWithCount from "@/src/server/qualityLevels/queries/getQualityLevelsWithCount"
import getSubsubsectionInfrasWithCount from "@/src/server/subsubsectionInfra/queries/getSubsubsectionInfrasWithCount"
import getSubsubsectionInfrastructureTypesWithCount from "@/src/server/subsubsectionInfrastructureType/queries/getSubsubsectionInfrastructureTypesWithCount"
import getSubsubsectionStatussWithCount from "@/src/server/subsubsectionStatus/queries/getSubsubsectionStatussWithCount"
import getSubsubsectionTasksWithCount from "@/src/server/subsubsectionTask/queries/getSubsubsectionTasksWithCount"
import { useQuery } from "@blitzjs/rpc"
import { Route } from "next"
import { z } from "zod"
import { subsubsectionLocationLabelMap } from "../utils/subsubsectionLocationLabelMap"
import { GeometryInput } from "./GeometryInput/GeometryInput"
import { LinkWithFormDirtyConfirm } from "./LinkWithFormDirtyConfirm"

export function SubsubsectionForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  const projectSlug = useProjectSlug()
  const [users] = useQuery(getProjectUsers, { projectSlug, role: "EDITOR" })

  const [{ qualityLevels }] = useQuery(getQualityLevelsWithCount, { projectSlug })
  const qualityLevelOptions = createFormOptions(
    qualityLevels,
    subsubsectionFieldTranslations.qualityLevelId,
    { optional: true, slugInLabel: true },
  )

  const [{ subsubsectionStatuss }] = useQuery(getSubsubsectionStatussWithCount, { projectSlug })
  const subsubsectionStatusOptions = createFormOptions(
    subsubsectionStatuss,
    subsubsectionFieldTranslations.subsubsectionStatusId,
    { optional: true, slugInLabel: false },
  )

  const [{ subsubsectionTasks }] = useQuery(getSubsubsectionTasksWithCount, { projectSlug })
  const subsubsectionTaskOptions = createFormOptions(
    subsubsectionTasks,
    subsubsectionFieldTranslations.subsubsectionTaskId,
  )

  const [{ subsubsectionInfras }] = useQuery(getSubsubsectionInfrasWithCount, { projectSlug })
  const subsubsectionInfraOptions = createFormOptions(
    subsubsectionInfras,
    subsubsectionFieldTranslations.subsubsectionInfraId,
    { optional: true, slugInLabel: true },
  )

  const [{ subsubsectionInfrastructureTypes }] = useQuery(
    getSubsubsectionInfrastructureTypesWithCount,
    { projectSlug },
  )
  const subsubsectionInfrastructureTypeOptions = createFormOptions(
    subsubsectionInfrastructureTypes,
    subsubsectionFieldTranslations.subsubsectionInfrastructureTypeId,
    { optional: true, slugInLabel: true },
  )

  return (
    <Form<S> {...props}>
      <LabeledTextField
        type="text"
        name="slug"
        label={subsubsectionFieldTranslations.slug}
        help="Nachträgliche Änderungen sorgen dafür, dass bisherige URLs (Bookmarks, in E-Mails) nicht mehr funktionieren."
      />
      <LabeledTextareaField
        name="description"
        label={`${subsubsectionFieldTranslations.description} (Markdown)`}
        optional
      />
      {/* UNUSED */}
      {/* <LabeledTextField type="text" name="subTitle" label="Title" optional /> */}
      <div className="flex items-end gap-5">
        <LabeledSelect
          name="subsubsectionTaskId"
          label={subsubsectionFieldTranslations.subsubsectionTaskId}
          options={subsubsectionTaskOptions}
          outerProps={{ className: "grow" }}
        />
        <LinkWithFormDirtyConfirm
          href={`/${projectSlug}/subsubsection-task` as Route}
          className="py-2"
        >
          Eintragstypen verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
      <GeometryInput />
      {/* @ts-expect-error the defaults work fine; but the helper should be updated at some point */}
      <LabeledCheckbox
        scope="isExistingInfra"
        label={subsubsectionFieldTranslations.isExistingInfra}
      />
      <LabeledRadiobuttonGroup
        label={subsubsectionFieldTranslations.location}
        scope="location"
        items={[
          { value: "URBAN", label: subsubsectionLocationLabelMap.URBAN },
          { value: "RURAL", label: subsubsectionLocationLabelMap.RURAL },
          { value: "", label: "keine Angabe" },
        ]}
        classNameItemWrapper="flex gap-5 space-y-0! items-center"
      />
      {/* UNUSED */}
      {/* <div>
        <LabeledCheckboxGroup
          scope="specialFeatures"
          label="Besonderheiten"
          items={subsubsectionSpecialOptions}
        />
        <div className="mt-4">
          <LinkWithFormDirtyConfirm
            href={`/${projectSlug}/subsubsection-special` as Route}
            className="py-2"
          >
            Besonderheiten verwalten…
          </LinkWithFormDirtyConfirm>
        </div>
      </div> */}
      <LabeledTextFieldCalculateLength
        name="lengthM"
        optional
        label={subsubsectionFieldTranslations.lengthM}
        help="Dieser Wert kann manuell eingetragen oder aus den vorhandenen Geometrien berechnet werden."
      />
      <LabeledTextField
        inlineLeadingAddon="m"
        type="number"
        step="0.01"
        name="width"
        label={subsubsectionFieldTranslations.width}
        optional
      />
      {/* UNUSED */}
      {/*
      <LabeledTextField
        inlineLeadingAddon="m"
        type="number"
        step="0.01"
        name="widthExisting"
        label="Breite Bestand"
        optional
      /> */}
      <LabeledTextField
        optional
        name="costEstimate"
        type="number"
        inlineLeadingAddon="€"
        label={subsubsectionFieldTranslations.costEstimate}
      />
      <div className="flex items-end gap-5">
        <LabeledSelect
          name="subsubsectionInfrastructureTypeId"
          label={subsubsectionFieldTranslations.subsubsectionInfrastructureTypeId}
          optional
          options={subsubsectionInfrastructureTypeOptions}
          outerProps={{ className: "grow" }}
        />
        <LinkWithFormDirtyConfirm
          href={`/${projectSlug}/subsubsection-infrastructure-type` as Route}
          className="py-2"
        >
          Fördergegenstand verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
      <div className="flex items-end gap-5">
        <LabeledSelect
          name="qualityLevelId"
          label={subsubsectionFieldTranslations.qualityLevelId}
          optional
          options={qualityLevelOptions}
          outerProps={{ className: "grow" }}
        />
        <LinkWithFormDirtyConfirm href={`/${projectSlug}/quality-levels` as Route} className="py-2">
          Ausbaustandards verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
      <div className="flex items-end gap-5">
        <LabeledSelect
          name="subsubsectionInfraId"
          label={subsubsectionFieldTranslations.subsubsectionInfraId}
          options={subsubsectionInfraOptions}
          outerProps={{ className: "grow" }}
        />
        <LinkWithFormDirtyConfirm
          href={`/${projectSlug}/subsubsection-infra` as Route}
          className="py-2"
        >
          Führungsformen verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
      <div className="flex items-end gap-5">
        <LabeledSelect
          name="subsubsectionStatusId"
          label={subsubsectionFieldTranslations.subsubsectionStatusId}
          optional
          options={subsubsectionStatusOptions}
          outerProps={{ className: "grow" }}
        />
        <LinkWithFormDirtyConfirm
          href={`/${projectSlug}/subsubsection-status` as Route}
          className="py-2"
        >
          Phase verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
      <LabeledTextField
        help="Format: Datum im Format JJJJ, beispielsweise '2026'"
        name="estimatedConstructionDateString"
        label={subsubsectionFieldTranslations.estimatedConstructionDateString}
        optional
      />
      {/* UNUSED */}
      {/* <LabeledTextField
        type="text"
        name="mapillaryKey"
        label={subsubsectionFieldTranslations.mapillaryKey}
        optional
        help="Die Mapillary Bild Referenz kann aus der URL als 'pKey' kopiert werden. Das ausgewählte Bild wird dann als eingebettete Vorschau auf der Seite angezeigt."
      /> */}
      <LabeledSelect
        name="managerId"
        label={subsubsectionFieldTranslations.managerId}
        optional
        options={getUserSelectOptions(users)}
      />
      <details>
        <summary className="mb-2 cursor-pointer">Anzeige-Optionen für Karten-Label</summary>
        <LabeledRadiobuttonGroupLabelPos />
      </details>
      <details>
        <summary className="mb-2 cursor-pointer">Verkehrsbelastung</summary>
        <LabeledTextField
          inlineLeadingAddon="kmh"
          type="number"
          name="maxSpeed"
          label={subsubsectionFieldTranslations.maxSpeed}
          optional
        />

        <LabeledTextField
          inlineLeadingAddon="Kfz"
          type="number"
          name="trafficLoad"
          label={subsubsectionFieldTranslations.trafficLoad}
          optional
        />

        <LabeledTextField
          type="date"
          name="trafficLoadDate"
          label={subsubsectionFieldTranslations.trafficLoadDate}
          optional
        />
      </details>
      <details>
        <summary className="mb-2 cursor-pointer">Kostenstruktur</summary>
        <LabeledTextField
          inlineLeadingAddon="€"
          type="number"
          name="planningCosts"
          label={subsubsectionFieldTranslations.planningCosts}
          optional
        />
        <LabeledTextField
          inlineLeadingAddon="€"
          type="number"
          name="constructionCosts"
          label={subsubsectionFieldTranslations.constructionCosts}
          optional
        />
        <LabeledTextField
          inlineLeadingAddon="€"
          type="number"
          name="deliveryCosts"
          label={subsubsectionFieldTranslations.deliveryCosts}
          optional
        />
        <LabeledTextField
          inlineLeadingAddon="€"
          type="number"
          name="landAcquisitionCosts"
          label={subsubsectionFieldTranslations.landAcquisitionCosts}
          optional
        />
        <LabeledTextField
          inlineLeadingAddon="€"
          type="number"
          name="expensesOfficialOrders"
          label={subsubsectionFieldTranslations.expensesOfficialOrders}
          optional
        />
        <LabeledTextField
          inlineLeadingAddon="€"
          type="number"
          name="expensesTechnicalVerification"
          label={subsubsectionFieldTranslations.expensesTechnicalVerification}
          optional
        />
        <LabeledTextField
          inlineLeadingAddon="€"
          type="number"
          name="nonEligibleExpenses"
          label={subsubsectionFieldTranslations.nonEligibleExpenses}
          optional
        />
        <LabeledTextField
          inlineLeadingAddon="€"
          type="number"
          name="revenuesEconomicIncome"
          label={subsubsectionFieldTranslations.revenuesEconomicIncome}
          optional
        />
        <LabeledTextField
          inlineLeadingAddon="€"
          type="number"
          name="contributionsThirdParties"
          label={subsubsectionFieldTranslations.contributionsThirdParties}
          optional
        />
        <LabeledTextField
          inlineLeadingAddon="€"
          type="number"
          name="grantsOtherFunding"
          label={subsubsectionFieldTranslations.grantsOtherFunding}
          optional
        />
        <LabeledTextField
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
          type="number"
          step={1}
          name="planningPeriod"
          label={subsubsectionFieldTranslations.planningPeriod}
          optional
          max={100}
        />
        <LabeledTextField
          type="number"
          step={1}
          name="constructionPeriod"
          label={subsubsectionFieldTranslations.constructionPeriod}
          optional
          max={100}
        />
        <LabeledTextField
          type="date"
          name="estimatedCompletionDate"
          label={subsubsectionFieldTranslations.estimatedCompletionDate}
          optional
        />
      </details>
    </Form>
  )
}
