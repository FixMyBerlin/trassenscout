import "maplibre-gl/dist/maplibre-gl.css"
import React from "react"
import { TLegendItem, TMapProps } from "../types"
import clsx from "clsx"

export type SurveyMapProps = { legend: TMapProps["legend"] }

const LegendItemShape: React.FC<{ legendItem: TLegendItem }> = ({ legendItem }) => {
  switch (legendItem.shape) {
    case "line":
      return <span className={clsx(legendItem.color, legendItem.height, "w-5")} />
    case "dot":
      return <span className={clsx(legendItem.color, legendItem.height, "w-4 rounded-full")} />
  }
}

export const SurveyMapLegend: React.FC<SurveyMapProps> = ({ legend }) => {
  return (
    <div className="bg-gray-200 gap-3 p-4 flex flex-col !-mt-0">
      {Object.entries(legend!).map(([key, value]) => (
        <div key={key} className="flex gap-5">
          <div className="h-6 flex flex-col justify-center">
            <LegendItemShape legendItem={value} />
          </div>
          <div className="text-small">{value.label.de}</div>
        </div>
      ))}
    </div>
  )
}
