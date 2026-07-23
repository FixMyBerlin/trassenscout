import "maplibre-gl/dist/maplibre-gl.css"
import { Fragment } from "react"
import { twJoin } from "tailwind-merge"

type TLegendItem = {
  label: string
  color: string
  className?: string
  outline?: boolean
}

type Props = Record<string, Record<string, TLegendItem>>

const LegendItemShape = ({ legendItem }: { legendItem: TLegendItem }) => {
  return (
    <span
      className={twJoin(
        "inline-block w-5 shrink-0",
        legendItem.outline === false ? null : "ring-1 ring-gray-900/70",
        legendItem.color,
        legendItem.className,
      )}
    />
  )
}

function isLegendItem(value: unknown): value is TLegendItem {
  return (
    typeof value === "object" &&
    value !== null &&
    "label" in value &&
    "color" in value &&
    typeof value.label === "string" &&
    typeof value.color === "string"
  )
}

export const SurveyMapLegend = (legend: Props) => {
  const legendGroups = Object.entries(legend).flatMap(([groupLabel, groupValue]) => {
    if (typeof groupValue !== "object" || groupValue === null || Array.isArray(groupValue)) {
      return []
    }

    const items = Object.entries(groupValue)
      .map(([itemKey, itemValue]) => ({ itemKey, itemValue }))
      .filter(({ itemValue }) => isLegendItem(itemValue))

    if (!items.length) return []

    return [{ groupLabel, items }]
  })

  return (
    <div className="mt-0! flex flex-col gap-3 bg-gray-100 p-4">
      {legendGroups.map(({ groupLabel, items }) => (
        <Fragment key={groupLabel}>
          <p>{groupLabel}</p>
          <div className="grid grid-cols-1 gap-y-1 sm:grid-cols-2">
            {items.map(({ itemKey, itemValue }) => (
              <div key={itemKey} className="flex items-center gap-2">
                <div className="flex h-6 flex-col justify-center">
                  <LegendItemShape legendItem={itemValue} />
                </div>
                <div className="text-sm leading-none font-semibold">{itemValue.label}</div>
              </div>
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  )
}
