import { clsx } from "clsx"
import "maplibre-gl/dist/maplibre-gl.css"
import { Fragment } from "react"

export type TLegendItem = {
  label: string
  color: string
  className?: string
}

type Props = Record<string, Record<string, TLegendItem>>

const LegendItemShape = ({ legendItem }: { legendItem: TLegendItem }) => {
  return <span className={clsx("w-5", legendItem.color, legendItem.className)} />
}

export const SurveyMapLegend = (legend: Props) => {
  return (
    <div className="!-mt-0 flex flex-col gap-3 bg-gray-200 p-4">
      {Object.entries(legend!).map(([key, value]) => (
        <Fragment key={key}>
          <p>{key}</p>
          <div className="grid-flow-row grid-cols-2 space-y-1 sm:grid md:grid-cols-2">
            {Object.entries(value!).map(([key, value]) => (
              <div key={key} className="flex gap-4">
                <div className="flex h-6 flex-col justify-center">
                  <LegendItemShape legendItem={value} />
                </div>
                <div className="text-sm font-semibold">{value.label}</div>
              </div>
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  )
}
