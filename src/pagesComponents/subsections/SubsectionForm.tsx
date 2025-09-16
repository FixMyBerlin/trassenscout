import { Spinner } from "@/src/core/components/Spinner"
import {
  Form,
  FormProps,
  LabeledCheckbox,
  LabeledSelect,
  LabeledTextField,
  LabeledTextareaField,
} from "@/src/core/components/forms"
import { LabeledGeometryField } from "@/src/core/components/forms/LabeledGeometryField"
import { LabeledTextFieldCalculateLength } from "@/src/core/components/forms/LabeledTextFieldCalculateLength"
import { shortTitle } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { LabeledRadiobuttonGroupLabelPos } from "@/src/pagesComponents/subsubsections/LabeledRadiobuttonGroupLabelPos"
import { LinkWithFormDirtyConfirm } from "@/src/pagesComponents/subsubsections/LinkWithFormDirtyConfirm"
import { getUserSelectOptions } from "@/src/pagesComponents/users/utils/getUserSelectOptions"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import getNetworkHierarchysWithCount from "@/src/server/networkHierarchy/queries/getNetworkHierarchysWithCount"
import getOperatorsWithCount from "@/src/server/operators/queries/getOperatorsWithCount"
import getSubsubsectionStatussWithCount from "@/src/server/subsubsectionStatus/queries/getSubsubsectionStatussWithCount"
import { Routes } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { PriorityEnum } from "@prisma/client"
import { Suspense } from "react"
import { z } from "zod"
import { getPriorityTranslation } from "./utils/getPriorityTranslation"

type Props<S extends z.ZodType<any, any>> = FormProps<S>

function SubsectionFormWithQuery<S extends z.ZodType<any, any>>({ ...props }: Props<S>) {
  const projectSlug = useProjectSlug()
  const [users] = useQuery(getProjectUsers, { projectSlug, role: "EDITOR" })
  const [{ operators }] = useQuery(getOperatorsWithCount, { projectSlug })
  const [{ networkHierarchys }] = useQuery(getNetworkHierarchysWithCount, { projectSlug })
  const operatorOptions: [number | string, string][] = [
    ["", "Baulastträger offen"],
    ...operators.map((o) => {
      return [
        o.id,
        `${o.title} – ${shortTitle(o.slug)} (bisher ${o.subsectionCount} Planungsabschnitte)`,
      ] as [number, string]
    }),
  ]
  const networkOptions: [number | string, string][] = [
    ["", "Netzstufe offen"],
    ...networkHierarchys.map((nh) => {
      return [
        nh.id,
        `${nh.title} – ${shortTitle(nh.slug)} (bisher ${nh.subsectionCount} Planungsabschnitte)`,
      ] as [number, string]
    }),
  ]
  const prioritySelectOptions = Object.entries(PriorityEnum).map(([priority, value]) => {
    return [priority, getPriorityTranslation(value)] as [string, string]
  })
  const [{ subsubsectionStatuss }] = useQuery(getSubsubsectionStatussWithCount, { projectSlug })
  const subsubsectionStatusOptions: [number | string, string][] = [
    ["", "Status offen"],
    ...subsubsectionStatuss.map((status) => {
      return [status.id, status.title] as [number, string]
    }),
  ]

  return (
    <Form<S> {...props}>
      <LabeledTextField
        type="text"
        name="slug"
        label="Kurztitel"
        help="Nachträgliche Änderungen sorgen dafür, dass bisherige URLs (Bookmarks, in E-Mails) nicht mehr funktionieren."
      />
      <div className="grid grid-cols-2 gap-5">
        <LabeledTextField type="text" name="start" label="Startpunkt" />
        <LabeledTextField type="text" name="end" label="Endpunkt" />
      </div>
      <LabeledTextareaField name="description" label="Beschreibung (Markdown)" optional />
      <LabeledGeometryField name="geometry" label="Geometry der Achse (LineString)" />
      {/* @ts-expect-error the defaults work fine; but the helper should be updated at some point */}
      <LabeledCheckbox
        label="Trassenverlauf geklärt"
        help="Wenn diese Option nicht aktiviert ist, wird der Abschnitt in der Karte der Projektansicht als ungeklärt (gestrichelte Linie) angezeigt."
        scope="isFinalRoute"
      />
      <LabeledTextFieldCalculateLength name="lengthM" label="Länge" />
      <details>
        <summary className="mb-2 cursor-pointer">Anzeige-Optionen für Karten-Label</summary>
        <div className="space-y-6">
          <LabeledRadiobuttonGroupLabelPos />
          <LabeledTextField
            type="number"
            step="1"
            name="order"
            label="Reihenfolge Planungsabschnitte"
            help="Die muss sicherstellen, dass die Geometrien in einer fortlaufenden Linie mit gleicher Linienrichtung dargestellt werden; sie ist auch die Standard-Sortierung."
          />
        </div>
      </details>
      <div className="flex items-end gap-5">
        <LabeledSelect
          name="operatorId"
          label="Baulastträger"
          optional
          options={operatorOptions}
          outerProps={{ className: "grow" }}
        />
        <LinkWithFormDirtyConfirm href={Routes.OperatorsPage({ projectSlug })} className="py-2">
          Baulastträger verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
      <div className="flex items-end gap-5">
        <LabeledSelect
          name="subsubsectionStatusId"
          label="Status"
          optional
          options={subsubsectionStatusOptions}
          outerProps={{ className: "grow" }}
        />
        <LinkWithFormDirtyConfirm
          href={Routes.SubsubsectionStatussPage({ projectSlug })}
          className="py-2"
        >
          Status verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
      <LabeledSelect
        name="managerId"
        label="Projektleiter:in"
        optional
        options={getUserSelectOptions(users)}
      />
      <LabeledTextField
        type="text"
        help="Format: Datum im Format JJJJ-MM, beispielsweise '2026-03'; Wert muss in ein Datum umgewandelt werden können."
        name="estimatedCompletionDateString"
        label="Jahr und Monat der geplanten Fertigstellung"
        optional
      />
      <LabeledSelect name="priority" label="Priorität" optional options={prioritySelectOptions} />
      <div className="flex items-end gap-5">
        <LabeledSelect
          name="networkHierarchyId"
          label="Netzstufe"
          optional
          options={networkOptions}
          outerProps={{ className: "grow" }}
        />
        <LinkWithFormDirtyConfirm
          href={Routes.NetworkHierarchysPage({ projectSlug })}
          className="py-2"
        >
          Netzstufen verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
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
