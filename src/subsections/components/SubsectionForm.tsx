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
import { LabeledGeometryField } from "src/core/components/forms/LabeledGeometryField"
import { LabeledRadiobuttonGroupLabelPos } from "src/core/components/forms/LabeledRadiobuttonGroupLabelPos"
import { Link } from "src/core/components/links"
import { quote, shortTitle } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import getOperatorsWithCount from "src/operators/queries/getOperatorsWithCount"
import { UserSelectOptions, getUserSelectOptions } from "src/users/utils"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

type Props<S extends z.ZodType<any, any>> = FormProps<S> & { users: UserSelectOptions }

function SubsectionFormWithQuery<S extends z.ZodType<any, any>>(props: Props<S>) {
  const { users } = props

  const { projectSlug } = useSlugs()
  const [{ operators }] = useQuery(getOperatorsWithCount, { projectSlug })
  const operatorOptions: [number | string, string][] = [
    ["", "Kein Baulastträger"],
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
        type="text"
        name="slug"
        label="Kurz-Titel und URL-Teil"
        help={`Bspw. ${quote(
          "pa1",
        )}. Primäre Auszeichnung des Planungsabschnitts. Wird immer in Großschreibung angezeigt aber in Kleinschreibung editiert. Nachträgliche Änderungen sorgen dafür, dass bisherige URLs (Bookmarks, in E-Mails) nicht mehr funktionieren.`}
      />
      <LabeledTextField
        type="number"
        step="1"
        name="order"
        label="Reihenfolge Planungsabschnitte"
        help="Die muss sicherstellen, dass die Geometrien in einer fortlaufenden Linie mit gleicher Linienrichtung dargestellt werden; sie ist auch die Standard-Sortierung."
      />
      <div className="grid grid-cols-2 gap-5">
        <LabeledTextField type="text" name="start" label="Startpunkt" />
        <LabeledTextField type="text" name="end" label="Endpunkt" />
      </div>
      <LabeledRadiobuttonGroupLabelPos />
      <LabeledTextareaField name="description" label="Beschreibung (Markdown)" optional />
      <LabeledGeometryField name="geometry" label="Geometry der Achse (LineString)" />

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
