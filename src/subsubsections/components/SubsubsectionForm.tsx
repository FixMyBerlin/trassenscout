import { Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import {
  Form,
  FormProps,
  LabeledRadiobuttonGroup,
  LabeledSelect,
  LabeledTextareaField,
  LabeledTextField,
} from "src/core/components/forms"
import { LabeledRadiobuttonGroupLabelPos } from "src/core/components/forms/LabeledRadiobuttonGroupLabelPos"
import { Link } from "src/core/components/links"
import { quote, shortTitle } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import getProjectUsers from "src/memberships/queries/getProjectUsers"
import getQualityLevelsWithCount from "src/qualityLevels/queries/getQualityLevelsWithCount"
import { getUserSelectOptions } from "src/users/utils"
import { z } from "zod"
import getSubsubsections from "../queries/getSubsubsections"
import { GeometryInput } from "./GeometryInput/GeometryInput"
export { FORM_ERROR } from "src/core/components/forms"

export function SubsubsectionForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  const { projectSlug } = useSlugs()
  const [users] = useQuery(getProjectUsers, { projectSlug: projectSlug! })
  const [{ subsubsections }] = useQuery(getSubsubsections, { projectSlug: projectSlug! })

  const [{ qualityLevels }] = useQuery(getQualityLevelsWithCount, { projectSlug })
  const qualityLevelOptions: [number | string, string][] = [
    ["", "Kein Ausbaustandard"],
    ...qualityLevels.map((ql) => {
      return [ql.id, `${ql.title} – ${shortTitle(ql.slug)}`] as [number, string]
    }),
  ]

  const ordersWithPlaceholder = () => {
    const maxOrder = Math.max(...subsubsections.map((s) => s.order)) + 5
    let orders: { order: string; label: string; readonly: boolean }[] = []

    for (let i = 0; i <= maxOrder; i++) {
      const subsubsection = subsubsections.find((sub) => sub.order === i)
      // @ts-expect-error no idea wo to get the types nice…
      const current = subsubsection && subsubsection.id === props.initialValues?.id
      orders.push({
        order: String(i),
        label: subsubsection
          ? `Position ${i}: ${shortTitle(subsubsection.slug)} ${
              current ? "(die Aktuelle Führung)" : ""
            }`
          : `Position ${i}`,
        readonly: Boolean(subsubsection && !current),
      })
    }
    orders.push({
      order: String(maxOrder + 1),
      label: `Position ${maxOrder + 1}`,
      readonly: false,
    })

    return orders
  }
  const orders = ordersWithPlaceholder()

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

      <LabeledRadiobuttonGroup
        label="Anzeige-Reihenfolge der Führungen"
        scope="order"
        items={orders.map(({ order, label, readonly }) => {
          return { value: order, label, readonly }
        })}
        classNameItemWrapper="sm:columns-2"
      />

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
      <LabeledTextField
        type="number"
        step="1"
        name="costEstimate"
        label="Kostenschätzung (in Euro)"
        optional
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
    </Form>
  )
}
