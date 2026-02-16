"use client"

import { getUserSelectOptions } from "@/src/app/_components/users/utils/getUserSelectOptions"
import { Spinner } from "@/src/core/components/Spinner"
import {
  Form,
  FormProps,
  LabeledSelect,
  LabeledTextField,
  LabeledTextareaField,
} from "@/src/core/components/forms"
import { LabeledTextFieldCalculateLength } from "@/src/core/components/forms/LabeledTextFieldCalculateLength"
import { createFormOptions } from "@/src/core/components/forms/_utils/createFormOptions"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import getProjectUsers from "@/src/server/memberships/queries/getProjectUsers"
import getNetworkHierarchysWithCount from "@/src/server/networkHierarchy/queries/getNetworkHierarchysWithCount"
import getOperatorsWithCount from "@/src/server/operators/queries/getOperatorsWithCount"
import getSubsectionStatussWithCount from "@/src/server/subsectionStatus/queries/getSubsectionStatussWithCount"
import { useQuery } from "@blitzjs/rpc"
import { PriorityEnum } from "@prisma/client"
import { Route } from "next"
import { Suspense } from "react"
import { z } from "zod"
import { LabeledRadiobuttonGroupLabelPos } from "../[subsectionSlug]/fuehrung/_components/LabeledRadiobuttonGroupLabelPos"
import { LinkWithFormDirtyConfirm } from "../[subsectionSlug]/fuehrung/_components/LinkWithFormDirtyConfirm"
import { getPriorityTranslation } from "../_utils/getPriorityTranslation"
import { SubsectionGeometryInput } from "./SubsectionGeometryInput"

type Props<S extends z.ZodType<any, any>> = FormProps<S>

function SubsectionFormWithQuery<S extends z.ZodType<any, any>>({ ...props }: Props<S>) {
  const projectSlug = useProjectSlug()
  const [users] = useQuery(
    getProjectUsers,
    { projectSlug, role: "EDITOR" },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  const [{ operators }] = useQuery(
    getOperatorsWithCount,
    { projectSlug },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const operatorOptions = createFormOptions(operators, "Baulastträger", {
    optional: true,
    slugInLabel: true,
  })

  const [{ networkHierarchys }] = useQuery(
    getNetworkHierarchysWithCount,
    { projectSlug },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const networkOptions = createFormOptions(networkHierarchys, "Netzstufe", {
    optional: true,
    slugInLabel: true,
  })

  const prioritySelectOptions = Object.entries(PriorityEnum).map(([priority, value]) => {
    return [priority, getPriorityTranslation(value)] as [string, string]
  })

  const [{ subsectionStatuss }] = useQuery(
    getSubsectionStatussWithCount,
    { projectSlug },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const subsectionStatusOptions = createFormOptions(subsectionStatuss, "Status", { optional: true })

  return (
    <Form<S> {...props}>
      <LabeledTextField
        type="text"
        name="slug"
        label="Kürzel"
        help="Nachträgliche Änderungen sorgen dafür, dass bisherige URLs (Bookmarks, in E-Mails) nicht mehr funktionieren."
      />
      <div className="grid grid-cols-2 gap-5">
        <LabeledTextField type="text" name="start" label="Startpunkt" />
        <LabeledTextField type="text" name="end" label="Endpunkt" />
      </div>
      <LabeledTextareaField name="description" label="Beschreibung (Markdown)" optional />
      <SubsectionGeometryInput />
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
      <LabeledTextFieldCalculateLength name="lengthM" label="Länge" optional />
      <div className="flex items-end gap-5">
        <LabeledSelect
          name="operatorId"
          label="Baulastträger"
          optional
          options={operatorOptions}
          outerProps={{ className: "grow" }}
        />
        <LinkWithFormDirtyConfirm href={`/${projectSlug}/operators` as Route} className="py-2">
          Baulastträger verwalten…
        </LinkWithFormDirtyConfirm>
      </div>
      <div className="flex items-end gap-5">
        <LabeledSelect
          name="subsectionStatusId"
          label="Status"
          optional
          options={subsectionStatusOptions}
          outerProps={{ className: "grow" }}
        />
        <LinkWithFormDirtyConfirm
          href={`/${projectSlug}/subsection-status` as Route}
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
          href={`/${projectSlug}/network-hierarchy` as Route}
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
