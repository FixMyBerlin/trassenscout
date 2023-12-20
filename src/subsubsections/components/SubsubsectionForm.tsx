import { Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import {
  Form,
  FormProps,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "src/core/components/forms"
import { LabeledRadiobuttonGroupLabelPos } from "src/subsubsections/components/LabeledRadiobuttonGroupLabelPos"
import { LabeledFormatNumberField } from "src/core/components/forms/LabeledFormatNumberField"
import { Link } from "src/core/components/links"
import { quote, shortTitle } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import getProjectUsers from "src/memberships/queries/getProjectUsers"
import getQualityLevelsWithCount from "src/qualityLevels/queries/getQualityLevelsWithCount"
import { getUserSelectOptions } from "src/users/utils"
import { z } from "zod"
import { GeometryInput } from "./GeometryInput/GeometryInput"
import getSubsubsectionStatussWithCount from "src/subsubsectionStatus/queries/getSubsubsectionStatussWithCount"
import getSubsubsectionTasksWithCount from "src/subsubsectionTask/queries/getSubsubsectionTasksWithCount"

export { FORM_ERROR } from "src/core/components/forms"

export function SubsubsectionForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  const { projectSlug } = useSlugs()
  const [users] = useQuery(getProjectUsers, { projectSlug: projectSlug! })

  const [{ qualityLevels }] = useQuery(getQualityLevelsWithCount, { projectSlug })
  const qualityLevelOptions: [number | string, string][] = [
    ["", "Ausbaustandard offen"],
    ...qualityLevels.map((ql) => {
      return [ql.id, `${ql.title} – ${shortTitle(ql.slug)}`] as [number, string]
    }),
  ]
  const [{ subsubsectionStatuss }] = useQuery(getSubsubsectionStatussWithCount, { projectSlug })
  const subsubsectionStatusOptions: [number | string, string][] = [
    ["", "Status offen"],
    ...subsubsectionStatuss.map((status) => {
      return [status.id, status.title] as [number, string]
    }),
  ]
  const [{ subsubsectionTasks }] = useQuery(getSubsubsectionTasksWithCount, { projectSlug })
  const subsubsectionTaskOptions: [number | string, string][] = [
    ["", "-"],
    ...subsubsectionTasks.map((task) => {
      return [task.id, task.title] as [number, string]
    }),
  ]

  return (
    <Form<S> {...props}>
      <LabeledTextField
        type="text"
        name="slug"
        label="Kurz-Titel und URL-Teil"
        help={`Bspw. ${quote("rf1")} oder ${quote(
          "sf2a",
        )}. Primäre Auszeichnung der Führung. Wird immer in Großschreibung angezeigt aber in Kleinschreibung editiert. Nachträgliche Änderungen sorgen dafür, dass bisherige URLs (Bookmarks, in E-Mails) nicht mehr funktionieren.`}
      />
      <LabeledTextField type="text" name="subTitle" label="Title" optional />

      <GeometryInput />
      <LabeledTextField
        type="text"
        name="task"
        label="Maßnahmentyp"
        help="Bspw. 'Fahrbahnmarkierung'"
      />
      <div className="flex items-end gap-5">
        <LabeledSelect
          name="subsubsectionTaskId"
          label="Maßnahmentyp ENUM"
          options={subsubsectionTaskOptions}
          outerProps={{ className: "grow" }}
        />
        <Link href={Routes.SubsubsectionTasksPage({ projectSlug: projectSlug! })} className="py-2">
          Maßnahmetypen verwalten…
        </Link>
      </div>
      <LabeledFormatNumberField
        inlineLeadingAddon="km"
        maxDecimalDigits={3}
        step="0.001"
        name="length"
        label="Länge"
        optional
      />
      <LabeledFormatNumberField
        inlineLeadingAddon="m"
        maxDecimalDigits={3}
        type="number"
        step="0.01"
        name="width"
        label="Breite"
        optional
      />
      <LabeledFormatNumberField
        name="costEstimate"
        inlineLeadingAddon="€"
        label="Kostenschätzung"
      />
      <div className="flex items-end gap-5">
        <LabeledSelect
          name="qualityLevelId"
          label="Ausbaustandard"
          optional
          options={qualityLevelOptions}
          outerProps={{ className: "grow" }}
        />
        <Link href={Routes.QualityLevelsPage({ projectSlug: projectSlug! })} className="py-2">
          Ausbaustandards verwalten…
        </Link>
      </div>
      <div className="flex items-end gap-5">
        <LabeledSelect
          name="subsubsectionStatusId"
          label="Status"
          optional
          options={subsubsectionStatusOptions}
          outerProps={{ className: "grow" }}
        />
        <Link
          href={Routes.SubsubsectionStatussPage({ projectSlug: projectSlug! })}
          className="py-2"
        >
          Status verwalten…
        </Link>
      </div>
      <LabeledTextField
        type="text"
        name="mapillaryKey"
        label="Mapillary Bild Referenz"
        optional
        help="Die Mapillary Bild Referenz kann aus der URL als 'pKey' kopiert werden. Das ausgewählte Bild wird dann als eingebettete Vorschau auf der Seite angezeigt."
      />
      <LabeledTextareaField name="description" label="Beschreibung (Markdown)" optional />
      <LabeledSelect
        name="managerId"
        label="Projektleiter:in"
        optional
        options={getUserSelectOptions(users)}
      />
      <LabeledRadiobuttonGroupLabelPos />
      <details>
        <summary className="mb-2 cursor-pointer">Verkehrsbelastung</summary>
        <LabeledFormatNumberField
          inlineLeadingAddon="kmh"
          maxDecimalDigits={0}
          type="number"
          name="maxSpeed"
          label="Zulässige Höchstgeschwindigkeit an der Straße"
          optional
        />

        <LabeledFormatNumberField
          inlineLeadingAddon="Kfz"
          maxDecimalDigits={0}
          type="number"
          name="trafficLoad"
          label="Verkehrsbelastung an Werktagen an dieser Straße (Kfz/24h)"
          optional
        />

        <LabeledTextField
          type="date"
          name="trafficLoadDate"
          label="Verkehrsbelastung ermittelt am (Datum)"
          optional
        />
      </details>
      <details>
        <summary className="mb-2 cursor-pointer">Kostenstruktur</summary>
        <LabeledFormatNumberField
          inlineLeadingAddon="€"
          type="number"
          name="planningCosts"
          label="Planungskosten"
          optional
        />
        <LabeledFormatNumberField
          inlineLeadingAddon="€"
          type="number"
          name="constructionCosts"
          label="Baukosten"
          optional
        />
        <LabeledFormatNumberField
          inlineLeadingAddon="€"
          type="number"
          name="deliveryCosts"
          label="Lieferkosten"
          optional
        />
        <LabeledFormatNumberField
          inlineLeadingAddon="€"
          type="number"
          name="landAcquisitionCosts"
          label="Grunderwerbskosten"
          optional
        />
        <LabeledFormatNumberField
          inlineLeadingAddon="€"
          type="number"
          name="expensesOfficialOrders"
          label="Ausgaben aufgrund behördlicher Anordnungen"
          optional
        />
        <LabeledFormatNumberField
          inlineLeadingAddon="€"
          type="number"
          name="expensesTechnicalVerification"
          label="Ausgaben für den fachtechnischen Nachweis usw."
          optional
        />
        <LabeledFormatNumberField
          inlineLeadingAddon="€"
          type="number"
          name="nonEligibleExpenses"
          label="Nicht zuwendungsfähige Ausgaben"
          optional
        />
        <LabeledFormatNumberField
          inlineLeadingAddon="€"
          type="number"
          name="revenuesEconomicIncome"
          label="Erlöse und wirtschafltiche Einnahmen"
          optional
        />
        <LabeledFormatNumberField
          inlineLeadingAddon="€"
          type="number"
          name="contributionsThirdParties"
          label="Beiträge Dritter"
          optional
        />
        <LabeledFormatNumberField
          inlineLeadingAddon="€"
          type="number"
          name="grantsOtherFunding"
          label="Zuwendungen aus anderen Förderprogrammen"
          optional
        />
        <LabeledFormatNumberField
          inlineLeadingAddon="€"
          type="number"
          name="ownFunds"
          label="Einsatz Eigenmittel"
          optional
        />
      </details>
    </Form>
  )
}
