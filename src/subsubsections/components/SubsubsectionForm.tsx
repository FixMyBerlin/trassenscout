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
import { LabeledCurrencyField } from "src/core/components/forms/LabeledCurrencyField"
import { Link } from "src/core/components/links"
import { quote, shortTitle } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import getProjectUsers from "src/memberships/queries/getProjectUsers"
import getQualityLevelsWithCount from "src/qualityLevels/queries/getQualityLevelsWithCount"
import { getUserSelectOptions } from "src/users/utils"
import { z } from "zod"
import { GeometryInput } from "./GeometryInput/GeometryInput"
export { FORM_ERROR } from "src/core/components/forms"

export function SubsubsectionForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  const { projectSlug } = useSlugs()
  const [users] = useQuery(getProjectUsers, { projectSlug: projectSlug! })

  const [{ qualityLevels }] = useQuery(getQualityLevelsWithCount, { projectSlug })
  const qualityLevelOptions: [number | string, string][] = [
    ["", "Kein Ausbaustandard"],
    ...qualityLevels.map((ql) => {
      return [ql.id, `${ql.title} – ${shortTitle(ql.slug)}`] as [number, string]
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
      <LabeledTextField
        type="number"
        step="0.001"
        name="length"
        label="Länge (in Kilometer)"
        optional
      />
      <LabeledTextField type="number" step="0.01" name="width" label="Breite (in Meter)" optional />
      <LabeledCurrencyField name="costEstimate" label="Kostenschätzung (in Euro)" />
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
        <LabeledTextField
          type="number"
          name="maxSpeed"
          label="Zulässige Höchstgeschwindigkeit an der Straße (kmh)"
          optional
        />

        <LabeledTextField
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
        <LabeledTextField type="number" name="planningCosts" label="Planungskosten" optional />
        <LabeledTextField type="number" name="constructionCosts" label="Baukosten" optional />
        <LabeledTextField type="number" name="deliveryCosts" label="Lieferkosten" optional />
        <LabeledTextField
          type="number"
          name="landAcquisitionCosts"
          label="Grunderwerbskosten (in Euro)"
          optional
        />
        <LabeledTextField
          type="number"
          name="expensesOfficialOrders"
          label="Ausgaben aufgrund behördlicher Anordnungen (in Euro)"
          optional
        />
        <LabeledTextField
          type="number"
          name="expensesTechnicalVerification"
          label="Ausgaben für den fachtechnischen Nachweis usw. (in Euro)"
          optional
        />
        <LabeledTextField
          type="number"
          name="nonEligibleExpenses"
          label="Nicht zuwendungsfähige Ausgaben (in Euro)"
          optional
        />
        <LabeledTextField
          type="number"
          name="revenuesEconomicIncome"
          label="Erlöse und wirtschafltiche Einnahmen (in Euro)"
          optional
        />
        <LabeledTextField
          type="number"
          name="contributionsThirdParties"
          label="Beiträge Dritter (in Euro)"
          optional
        />
        <LabeledTextField
          type="number"
          name="grantsOtherFunding"
          label="Zuwendungen aus anderen Förderprogrammen (in Euro)"
          optional
        />
        <LabeledTextField type="number" name="ownFunds" label="Einsatz Eigenmittel" optional />
      </details>
    </Form>
  )
}
