import { Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import {
  Form,
  FormProps,
  LabeledSelect,
  LabeledTextField,
  LabeledTextareaField,
} from "src/core/components/forms"
import { LabeledFormatNumberField } from "src/core/components/forms/LabeledFormatNumberField"
import { LabeledGeometryField } from "src/core/components/forms/LabeledGeometryField"
import { Link } from "src/core/components/links"
import { quote, shortTitle } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import getOperatorsWithCount from "src/operators/queries/getOperatorsWithCount"
import { LabeledRadiobuttonGroupLabelPos } from "src/subsubsections/components/LabeledRadiobuttonGroupLabelPos"
import { UserSelectOptions, getUserSelectOptions } from "src/users/utils"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

type Props<S extends z.ZodType<any, any>> = FormProps<S> & {
  users: UserSelectOptions
  isFeltFieldsReadOnly?: boolean
}

function SubsectionFormWithQuery<S extends z.ZodType<any, any>>({
  users,
  isFeltFieldsReadOnly,
  ...props
}: Props<S>) {
  const { projectSlug } = useSlugs()
  const [{ operators }] = useQuery(getOperatorsWithCount, { projectSlug })
  const operatorOptions: [number | string, string][] = [
    ["", "Baulastträger offen"],
    ...operators.map((o) => {
      return [
        o.id,
        `${o.title} – ${shortTitle(o.slug)} (bisher ${o.subsectionCount} Planungsabschnitte)`,
      ] as [number, string]
    }),
  ]

  return (
    <Form<S> {...props}>
      <LabeledTextField
        inlineLeadingAddon="pa"
        type="text"
        name="slug"
        label="Id für Kurz-Titel und URL-Teil"
        help={`Primäre Auszeichnung des Planungsabschnitts. Wird immer in Großschreibung angezeigt, aber in Kleinschreibung editiert. Nachträgliche Änderungen sorgen dafür, dass bisherige URLs (Bookmarks, in E-Mails) nicht mehr funktionieren. Präfix aller Planungsabschnitte ist ${quote(
          "pa",
        )}. Zusätzlich muss eine Präfix-Id angegeben werden. Ergebnis: pa[Präfix-Id]`}
      />
      <LabeledTextField
        type="number"
        step="1"
        name="order"
        label="Reihenfolge Planungsabschnitte"
        help="Die muss sicherstellen, dass die Geometrien in einer fortlaufenden Linie mit gleicher Linienrichtung dargestellt werden; sie ist auch die Standard-Sortierung."
      />
      <div className="grid grid-cols-2 gap-5">
        <LabeledTextField
          type="text"
          name="start"
          label="Startpunkt"
          help={isFeltFieldsReadOnly ? `Diese Information kann nur in Felt editiert werden` : ""}
          readOnly={isFeltFieldsReadOnly}
        />
        <LabeledTextField
          type="text"
          name="end"
          label="Endpunkt"
          help={isFeltFieldsReadOnly ? `Diese Information kann nur in Felt editiert werden` : ""}
          readOnly={isFeltFieldsReadOnly}
        />
      </div>
      <LabeledTextareaField name="description" label="Beschreibung (Markdown)" optional />
      <LabeledGeometryField
        help={isFeltFieldsReadOnly ? `Diese Information kann nur in Felt editiert werden` : ""}
        readOnly={isFeltFieldsReadOnly}
        name="geometry"
        label="Geometry der Achse (LineString)"
      />
      <LabeledFormatNumberField
        inlineLeadingAddon="km"
        maxDecimalDigits={3}
        step="0.001"
        name="lengthKm"
        label="Länge"
        optional
        help={
          isFeltFieldsReadOnly
            ? `Dieser Wert wird aus den Geometrien (Felt) berechnet und kann nicht manuell editiert werden.`
            : ""
        }
        readOnly={isFeltFieldsReadOnly}
      />
      <LabeledRadiobuttonGroupLabelPos />

      <div className="flex items-end gap-5">
        <LabeledSelect
          name="operatorId"
          label="Baulastträger"
          optional
          options={operatorOptions}
          outerProps={{ className: "grow" }}
        />
        <Link href={Routes.OperatorsPage({ projectSlug: projectSlug! })} className="py-2">
          Baulastträger verwalten…
        </Link>
      </div>

      <LabeledSelect
        name="managerId"
        label="Projektleiter:in"
        optional
        options={getUserSelectOptions(users)}
      />
    </Form>
  )
}

export function SubsectionForm<S extends z.ZodType<any, any>>(props: Props<S>) {
  return (
    <Suspense fallback={<Spinner />}>
      <SubsectionFormWithQuery {...props} />
    </Suspense>
  )
}
