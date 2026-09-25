import { AdminBadge } from "@/src/components/admin/AdminBadge"
import { FormDetailsSummary } from "@/src/components/core/components/forms/FormDetailsSummary"
import {
  formDetailsClassName,
  formDetailsPanelClassName,
} from "@/src/components/core/components/forms/styles/formDetailsStyles"
import {
  tableBodyClassName,
  tableCellClassName,
  tableClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"

type ModeCell = "none" | "read" | "draft" | "live" | "confirm"

type CapabilityRow = {
  action: string
  tools: string
  disabled: ModeCell
  draft: ModeCell
  direct: ModeCell
}

const groups: { title: string; rows: CapabilityRow[] }[] = [
  {
    title: "Umgebung und Projekte",
    rows: [
      {
        action: "Umgebung prüfen",
        tools: "env_info",
        disabled: "read",
        draft: "read",
        direct: "read",
      },
      {
        action: "Projektliste",
        tools: "projects_list",
        disabled: "read",
        draft: "read",
        direct: "read",
      },
    ],
  },
  {
    title: "Planungsabschnitte",
    rows: [
      {
        action: "Schema und Liste",
        tools: "subsections_schema, subsections_list",
        disabled: "none",
        draft: "read",
        direct: "read",
      },
      {
        action: "Anlegen und ändern",
        tools: "subsections_create, subsections_update",
        disabled: "none",
        draft: "draft",
        direct: "live",
      },
      {
        action: "Löschen",
        tools: "subsections_delete",
        disabled: "none",
        draft: "none",
        direct: "confirm",
      },
    ],
  },
  {
    title: "Maßnahmen",
    rows: [
      {
        action: "Schema und Liste",
        tools: "subsubsections_schema, subsubsections_list",
        disabled: "none",
        draft: "read",
        direct: "read",
      },
      {
        action: "Anlegen und ändern",
        tools: "subsubsections_create, subsubsections_update",
        disabled: "none",
        draft: "draft",
        direct: "live",
      },
      {
        action: "Löschen",
        tools: "subsubsections_delete",
        disabled: "none",
        draft: "none",
        direct: "confirm",
      },
    ],
  },
  {
    title: "Kataloge — Baulastträger, Führungsform (RVA), Phase, Maßnahmentyp",
    rows: [
      {
        action: "Auflisten",
        tools:
          "operators_list, subsubsection_infras_list, subsubsection_statuses_list, subsubsection_tasks_list",
        disabled: "none",
        draft: "read",
        direct: "read",
      },
      {
        action: "Anlegen und ändern",
        tools: "*_create, *_update",
        disabled: "none",
        draft: "none",
        direct: "live",
      },
      {
        action: "Löschen",
        tools: "*_delete",
        disabled: "none",
        draft: "none",
        direct: "confirm",
      },
    ],
  },
  {
    title: "Protokolleinträge",
    rows: [
      {
        action: "Auflisten",
        tools: "project_records_list",
        disabled: "none",
        draft: "read",
        direct: "read",
      },
      {
        action: "Anlegen und ändern",
        tools: "project_records_create, project_records_update",
        disabled: "none",
        draft: "draft",
        direct: "live",
      },
      {
        action: "Löschen",
        tools: "project_records_delete",
        disabled: "none",
        draft: "none",
        direct: "confirm",
      },
    ],
  },
]

const cellLabel: Record<ModeCell, string> = {
  none: "—",
  read: "Lesen",
  draft: "Entwurf",
  live: "Sofort",
  confirm: "Bestätigen",
}

const cellClassName: Record<ModeCell, string> = {
  none: "text-gray-300",
  read: "text-gray-700",
  draft: "text-amber-800",
  live: "font-medium text-green-800",
  confirm: "font-medium text-green-800",
}

function ModeCellView({ value }: { value: ModeCell }) {
  return <span className={cellClassName[value]}>{cellLabel[value]}</span>
}

const modes = [
  {
    title: "Aus",
    variant: "gray" as const,
    text: "Projekt-Tools sind gesperrt. Umgebung und Projektliste bleiben lesbar, inkl. wirksamem Modus.",
  },
  {
    title: "Entwürfe",
    variant: "yellow" as const,
    text: "Lesen sowie Anlegen und Ändern von Planungsabschnitten, Maßnahmen und Protokollen als Entwurf. Kataloge nur lesen. Kein Löschen.",
  },
  {
    title: "Direkt",
    variant: "green" as const,
    text: "24 Stunden ab dem Einschalten, danach wieder Entwürfe. Anlegen und Ändern schreiben sofort. Löschen und Katalog-Schreiben nur hier.",
  },
]

export function McpCapabilitiesOverview() {
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {modes.map((mode) => (
        <li key={mode.title} className="rounded-md border border-gray-200 bg-white p-3">
          <AdminBadge variant={mode.variant}>{mode.title}</AdminBadge>
          <p className="mt-2 text-gray-600">{mode.text}</p>
        </li>
      ))}
    </ul>
  )
}

export function McpCapabilitiesDetails() {
  return (
    <details className={formDetailsClassName}>
      <FormDetailsSummary>Funktionen nach Bereich</FormDetailsSummary>
      <div className={formDetailsPanelClassName}>
        <div className="overflow-x-auto">
          <table className={tableClassName}>
            <thead>
              <tr className={tableHeadRowClassName}>
                <th className="px-3 pt-3 pb-2 text-left font-medium text-gray-700">Funktion</th>
                <th className="px-3 pt-3 pb-2 text-left font-medium text-gray-700">Aus</th>
                <th className="px-3 pt-3 pb-2 text-left font-medium text-gray-700">Entwürfe</th>
                <th className="px-3 pt-3 pb-2 text-left font-medium text-gray-700">Direkt</th>
              </tr>
            </thead>
            {groups.map((group) => (
              <tbody key={group.title} className={tableBodyClassName}>
                <tr className="bg-gray-50">
                  <th
                    scope="rowgroup"
                    colSpan={4}
                    className="px-3 py-2 text-left font-semibold text-gray-900"
                  >
                    {group.title}
                  </th>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.action} className={tableRowClassName}>
                    <th scope="row" className={`${tableCellClassName} font-medium text-gray-900`}>
                      {row.action}
                      <span className="mt-0.5 block text-xs font-normal text-gray-500">
                        <code>{row.tools}</code>
                      </span>
                    </th>
                    <td className={tableCellClassName}>
                      <ModeCellView value={row.disabled} />
                    </td>
                    <td className={tableCellClassName}>
                      <ModeCellView value={row.draft} />
                    </td>
                    <td className={tableCellClassName}>
                      <ModeCellView value={row.direct} />
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
        <ul className="list-disc space-y-1 pl-5 text-gray-600">
          <li>
            <strong>Entwurf</strong> landet nur als Entwurf. Übernehmen in der App: Einsetzen →
            Formular → Speichern / Erstellen. Offene Entwürfe werden nach 14 Tagen gelöscht.
          </li>
          <li>
            <strong>Sofort</strong> schreibt den Live-Datensatz. Direkt gilt 24 Stunden; danach sind
            wieder Entwürfe wirksam, bis Direkt neu eingeschaltet wird.
          </li>
          <li>
            <strong>Bestätigen</strong>: ohne <code>confirm</code> nur eine Vorschau, nichts wird
            geschrieben. Mit Bestätigung nur leere Datensätze — Maßnahmen ohne Protokoll, Upload
            oder Grunderwerb, Planungsabschnitte ohne Maßnahmen, unbenutzte Katalogzeilen,
            Protokolle ohne Kommentare oder Uploads.
          </li>
          <li>
            Kataloge haben keinen Entwurfsmodus. Weggelassenes Feld bleibt unverändert;{" "}
            <code>null</code> und leerer String löschen keinen Wert. Listen liefern 20 Zeilen,
            höchstens 50.
          </li>
        </ul>
      </div>
    </details>
  )
}
