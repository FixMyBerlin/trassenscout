import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react"
import { ChevronRightIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid"
import { ReactElement, ReactNode, useId } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { twJoin } from "tailwind-merge"
import {
  tableBodyClassName,
  tableCellClassName,
  tableClassName,
  tableHeadCellClassName,
  tableHeadCellRightClassName,
  tableHeadRowClassName,
  tableRowClassName,
} from "@/src/components/core/components/Table/tableClasses"
import { formattedEuro } from "@/src/components/core/components/text/formattedProperties"
import { formatBerlinTime } from "@/src/components/core/utils/formatBerlinTime"
import {
  type EvaluationBarChartDatum,
  type EvaluationChartDataset,
  type EvaluationChartType,
  type EvaluationChartUnit,
  type EvaluationDeadlineSummaryDatum,
  evaluationChartDescriptions,
  evaluationChartLabels,
  evaluationChartNotes,
  evaluationChartOrientation,
  evaluationChartTableHeaders,
} from "@/src/shared/evaluations/evaluationsPageConfig"

type EvaluationChartOrientation = (typeof evaluationChartOrientation)[EvaluationChartType]

type Props = {
  chart: EvaluationChartType
  data: EvaluationChartDataset | undefined
}

type TableHeaders = { label: string; value: string }

const numberFormatter = new Intl.NumberFormat("de-DE")

const axisEuroFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})

const chartColors = [
  "var(--color-blue-500)", // #2c62a9
  "var(--color-yellow-600)", // #b68c06
  "var(--color-green-700)", // #047857
  "var(--color-pink-500)", // #e5007d
  "var(--color-blue-300)", // #6697d7
  "var(--color-red-700)", // #be123c
]

const MAX_BAR_SIZE = 40

const BAR_BAND = MAX_BAR_SIZE + 24

const AXIS_FONT_SIZE = 12
const AXIS_TICK = { fontSize: AXIS_FONT_SIZE, fill: "var(--color-gray-600)" } as const

const HOVER_CURSOR = { fill: "var(--color-gray-100)" } as const

function categoryAxisWidth(rows: EvaluationBarChartDatum[]) {
  const longest = rows.reduce((max, row) => Math.max(max, row.label.length), 0)
  return Math.min(320, Math.max(100, Math.round(longest * AXIS_FONT_SIZE * 0.58) + 16))
}

function formatValue(value: number, unit: EvaluationChartUnit) {
  return unit === "eur" ? formattedEuro(value) : numberFormatter.format(value)
}

function formatAxisValue(value: number, unit: EvaluationChartUnit) {
  return unit === "eur" ? axisEuroFormatter.format(value) : numberFormatter.format(value)
}

function chartHeight(rowCount: number, orientation: EvaluationChartOrientation) {
  if (orientation === "columns") return 300
  return Math.max(150, rowCount * BAR_BAND + 56)
}

function EmptyChart() {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-600">
      Für dieses Diagramm sind noch keine Daten vorhanden.
    </div>
  )
}

function ChartNote({ note }: { note?: string }) {
  if (!note) return null
  return <p className="mt-2 text-sm text-gray-500">{note}</p>
}

function DataTableAccordion({
  children,
  label = "Datentabelle",
}: {
  children: ReactNode
  label?: string
}) {
  return (
    <Disclosure
      as="div"
      className="not-prose mt-4 overflow-hidden rounded-md border border-gray-200 bg-white"
    >
      <DisclosureButton className="group flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
        <ChevronRightIcon
          className="size-5 shrink-0 text-gray-500 transition-transform duration-200 group-data-open:rotate-90 motion-reduce:transition-none"
          aria-hidden="true"
        />
        {label}
      </DisclosureButton>
      <DisclosurePanel
        transition
        className="grid grid-rows-[1fr] overflow-hidden border-t border-gray-200 opacity-100 transition-[grid-template-rows,opacity] duration-200 ease-out data-closed:grid-rows-[0fr] data-closed:border-t-0 data-closed:opacity-0 motion-reduce:transition-none"
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </DisclosurePanel>
    </Disclosure>
  )
}

/** Not `TableWrapper`: its border chrome would double up inside the accordion's own border. */
function DataTableScroll({ children }: { children: ReactNode }) {
  return <div className="w-full overflow-x-auto">{children}</div>
}

/** Shared shell: a chart is one `role="img"` with an sr-only title and description. */
function ChartFrame({
  title,
  description,
  height,
  children,
}: {
  title: string
  description: string
  height: number
  children: ReactElement
}) {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <div
      className="not-prose w-full"
      style={{ height }}
      role="img"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <p id={titleId} className="sr-only">
        {title}
      </p>
      <p id={descriptionId} className="sr-only">
        {description}
      </p>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

function SimpleBarChart({
  rows,
  unit,
  title,
  description,
  orientation,
}: {
  rows: EvaluationBarChartDatum[]
  unit: EvaluationChartUnit
  title: string
  description: string
  orientation: EvaluationChartOrientation
}) {
  const isColumns = orientation === "columns"
  const valueAxis = {
    type: "number",
    tick: AXIS_TICK,
    tickFormatter: (value: number) => formatAxisValue(Number(value), unit),
  } as const
  const categoryAxis = {
    dataKey: "label",
    type: "category",
    tickLine: false,
    tick: AXIS_TICK,
    interval: 0,
  } as const

  return (
    <ChartFrame
      title={title}
      description={description}
      height={chartHeight(rows.length, orientation)}
    >
      <BarChart
        data={rows}
        accessibilityLayer
        layout={isColumns ? "horizontal" : "vertical"}
        margin={{ top: 12, right: 32, bottom: 12, left: 8 }}
      >
        <CartesianGrid
          stroke="var(--color-gray-200)"
          horizontal={isColumns}
          vertical={!isColumns}
        />
        {isColumns ? <XAxis {...categoryAxis} /> : <XAxis {...valueAxis} />}
        {isColumns ? (
          <YAxis {...valueAxis} />
        ) : (
          <YAxis {...categoryAxis} width={categoryAxisWidth(rows)} />
        )}
        <Tooltip cursor={HOVER_CURSOR} formatter={(value) => formatValue(Number(value), unit)} />
        <Bar
          dataKey="value"
          fill={chartColors[0]}
          name={title}
          maxBarSize={MAX_BAR_SIZE}
          radius={isColumns ? [4, 4, 0, 0] : [0, 4, 4, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ChartFrame>
  )
}

function GroupedBarChart({
  data,
  title,
  description,
}: {
  data: Extract<EvaluationChartDataset, { kind: "groupedBar" }>
  title: string
  description: string
}) {
  const rows = data.rows.map((row) => ({
    label: row.label,
    ...Object.fromEntries(
      data.series.map((series, index) => [`v${index}`, row.values[series.key] ?? 0]),
    ),
  }))

  return (
    <ChartFrame
      title={title}
      description={description}
      height={chartHeight(data.rows.length, "columns")}
    >
      <BarChart
        data={rows}
        accessibilityLayer
        barGap={2}
        margin={{ top: 12, right: 32, bottom: 12, left: 12 }}
      >
        <CartesianGrid stroke="var(--color-gray-200)" vertical={false} />
        <XAxis dataKey="label" tickLine={false} tick={AXIS_TICK} interval={0} />
        <YAxis allowDecimals={false} tick={AXIS_TICK} />
        <Tooltip cursor={HOVER_CURSOR} formatter={(value) => formatValue(Number(value), "count")} />
        <Legend />
        {data.series.map((series, index) => (
          <Bar
            key={series.key}
            dataKey={`v${index}`}
            fill={chartColors[index % chartColors.length]}
            name={series.label}
            maxBarSize={MAX_BAR_SIZE}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ChartFrame>
  )
}

function BarChartDataTable({
  title,
  rows,
  unit,
  headers,
}: {
  title: string
  rows: EvaluationBarChartDatum[]
  unit: EvaluationChartUnit
  headers: TableHeaders
}) {
  return (
    <DataTableScroll>
      <table className={tableClassName} aria-label={`Datentabelle: ${title}`}>
        <thead>
          <tr className={tableHeadRowClassName}>
            <th className={tableHeadCellClassName} scope="col">
              {headers.label}
            </th>
            <th className={tableHeadCellRightClassName} scope="col">
              {headers.value}
            </th>
          </tr>
        </thead>
        <tbody className={tableBodyClassName}>
          {rows.map((row) => (
            <tr key={row.label} className={tableRowClassName}>
              <td className={tableCellClassName}>{row.label}</td>
              <td className={twJoin(tableCellClassName, "text-right")}>
                {formatValue(row.value, unit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableScroll>
  )
}

function GroupedBarChartDataTable({
  title,
  data,
  headers,
}: {
  title: string
  data: Extract<EvaluationChartDataset, { kind: "groupedBar" }>
  headers: TableHeaders
}) {
  return (
    <DataTableScroll>
      <table className={tableClassName} aria-label={`Datentabelle: ${title}`}>
        <thead>
          <tr className={tableHeadRowClassName}>
            <th className={tableHeadCellClassName} scope="col">
              {headers.label}
            </th>
            {data.series.map((series) => (
              <th key={series.key} className={tableHeadCellRightClassName} scope="col">
                {series.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={tableBodyClassName}>
          {data.rows.map((row) => (
            <tr key={row.label} className={tableRowClassName}>
              <td className={tableCellClassName}>{row.label}</td>
              {data.series.map((series) => (
                <td key={series.key} className={twJoin(tableCellClassName, "text-right")}>
                  {formatValue(row.values[series.key] ?? 0, "count")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableScroll>
  )
}

function DeadlinesDetailTable({
  title,
  data,
}: {
  title: string
  data: Extract<EvaluationChartDataset, { kind: "deadlines" }>
}) {
  return (
    <DataTableScroll>
      <table className={tableClassName} aria-label={`Fristen: ${title}`}>
        <thead>
          <tr className={tableHeadRowClassName}>
            <th className={tableHeadCellClassName} scope="col">
              Planungsabschnitt
            </th>
            <th className={tableHeadCellClassName} scope="col">
              Maßnahme
            </th>
            <th className={tableHeadCellClassName} scope="col">
              Frist
            </th>
            <th className={tableHeadCellClassName} scope="col">
              Status
            </th>
          </tr>
        </thead>
        <tbody className={tableBodyClassName}>
          {data.deadlines.map((deadline) => (
            <tr key={`${deadline.subsectionLabel}/${deadline.label}`} className={tableRowClassName}>
              <td className={tableCellClassName}>{deadline.subsectionLabel}</td>
              <td className={tableCellClassName}>{deadline.label}</td>
              <td className={tableCellClassName}>{formatBerlinTime(deadline.dueDate)}</td>
              <td className={tableCellClassName}>
                {deadline.status === "overdue" ? "Überfällig" : "Anstehend"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTableScroll>
  )
}

/** Two counts are a stat pair, not a chart — a two-bar bar chart says less than the numbers. */
function DeadlineStatTiles({ rows }: { rows: EvaluationDeadlineSummaryDatum[] }) {
  return (
    <dl className="not-prose grid grid-cols-1 gap-3 sm:grid-cols-2">
      {rows.map((row) => {
        const isOverdue = row.status === "overdue"
        return (
          <div
            key={row.label}
            className={twJoin(
              "rounded-md border px-4 py-3",
              isOverdue ? "border-red-200 bg-red-50" : "border-gray-200 bg-white",
            )}
          >
            <dt className="flex items-center gap-1.5 text-sm text-gray-600">
              {isOverdue ? (
                <ExclamationTriangleIcon className="size-4 text-red-700" aria-hidden />
              ) : null}
              {row.label}
            </dt>
            <dd
              className={twJoin(
                "mt-1 text-2xl font-semibold",
                isOverdue ? "text-red-700" : "text-gray-900",
              )}
            >
              {numberFormatter.format(row.value)}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}

/** Switches on the dataset kind the server produced — the chart type only picks the copy. */
function ChartBody({ chart, data }: { chart: EvaluationChartType; data: EvaluationChartDataset }) {
  const title = evaluationChartLabels[chart]
  const description = evaluationChartDescriptions[chart]
  const headers = evaluationChartTableHeaders[chart]

  switch (data.kind) {
    case "bar":
      return (
        <>
          <SimpleBarChart
            rows={data.rows}
            unit={data.unit}
            title={title}
            description={description}
            orientation={evaluationChartOrientation[chart]}
          />
          <DataTableAccordion>
            <BarChartDataTable title={title} rows={data.rows} unit={data.unit} headers={headers} />
          </DataTableAccordion>
        </>
      )
    case "groupedBar":
      return (
        <>
          <GroupedBarChart data={data} title={title} description={description} />
          <DataTableAccordion>
            <GroupedBarChartDataTable title={title} data={data} headers={headers} />
          </DataTableAccordion>
        </>
      )
    case "deadlines":
      return (
        <>
          <DeadlineStatTiles rows={data.rows} />
          {data.deadlines.length ? (
            <DataTableAccordion label="Fristen im Detail">
              <DeadlinesDetailTable title={title} data={data} />
            </DataTableAccordion>
          ) : null}
        </>
      )
  }
}

export function EvaluationChartRenderer({ chart, data }: Props) {
  return (
    <figure className="w-full max-w-3xl space-y-3">
      <figcaption>
        <h2 className="text-base font-semibold text-gray-900">{evaluationChartLabels[chart]}</h2>
      </figcaption>

      {data && data.rows.length > 0 ? <ChartBody chart={chart} data={data} /> : <EmptyChart />}

      <ChartNote note={evaluationChartNotes[chart]} />
    </figure>
  )
}
