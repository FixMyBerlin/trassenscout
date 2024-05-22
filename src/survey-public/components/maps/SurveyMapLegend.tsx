import "maplibre-gl/dist/maplibre-gl.css"
import React, { Fragment } from "react"
import { TLegendItem, TMapProps } from "../types"
import clsx from "clsx"

type SurveyMapLegendProps = { legend: TMapProps["legend"] }

const LegendItemShape: React.FC<{ legendItem: TLegendItem }> = ({ legendItem }) => {
  return <span className={clsx(legendItem.color, legendItem.className, "w-5")} />
}

export const SurveyMapLegend: React.FC<SurveyMapLegendProps> = ({ legend }) => {
  return (
    <div className="bg-gray-200 gap-3 p-4 flex flex-col !-mt-0">
      {Object.entries(legend!).map(([key, value]) => (
        <Fragment key={key}>
          <p>{key}</p>
          <div className="sm:grid grid-flow-row grid-cols-2 md:grid-cols-2 space-y-1">
            {Object.entries(value!).map(([key, value]) => (
              <div key={key} className="flex gap-4">
                <div className="h-6 flex flex-col justify-center">
                  <LegendItemShape legendItem={value} />
                </div>
                <div className="text-sm font-semibold">{value.label.de}</div>
              </div>
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  )
}
