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
import { LabeledRadiobuttonGroupLabelPos } from "src/subsubsections/components/LabeledRadiobuttonGroupLabelPos"
import { Link } from "src/core/components/links"
import { quote, shortTitle } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import getOperatorsWithCount from "src/operators/queries/getOperatorsWithCount"
import getProject from "src/projects/queries/getProject"
import { UserSelectOptions, getUserSelectOptions } from "src/users/utils"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

type Props<S extends z.ZodType<any, any>> = FormProps<S> & {
  users: UserSelectOptions
  edit?: boolean
}

function SubsectionFormWithQuery<S extends z.ZodType<any, any>>({
  users,
  edit,
  ...props
}: Props<S>) {
  const { projectSlug } = useSlugs()
  const [project] = useQuery(getProject, { slug: projectSlug })
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
  const isReadOnlyFields = !!(edit && project?.felt_subsection_geometry_source_url)

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
          help={isReadOnlyFields ? `Diese Information kann nur in Felt editiert werden` : ""}
          readOnly={isReadOnlyFields}
        />
        <LabeledTextField
          type="text"
          name="end"
          label="Endpunkt"
          help={isReadOnlyFields ? `Diese Information kann nur in Felt editiert werden` : ""}
          readOnly={isReadOnlyFields}
        />
      </div>
      <LabeledTextareaField name="description" label="Beschreibung (Markdown)" optional />
      <LabeledGeometryField
        help={isReadOnlyFields ? `Diese Information kann nur in Felt editiert werden` : ""}
        readOnly={isReadOnlyFields}
        name="geometry"
        label="Geometry der Achse (LineString)"
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
