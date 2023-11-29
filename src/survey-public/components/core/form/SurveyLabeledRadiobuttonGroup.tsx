import clsx from "clsx"
import React from "react"
import { SurveyLabeledRadiobutton, SurveyLabeledRadiobuttonProps } from "./SurveyLabeledRadiobutton"

type Props = {
  items: SurveyLabeledRadiobuttonProps[]
  className?: string
}

export const SurveyLabeledRadiobuttonGroup: React.FC<Props> = ({ items, className }) => {
  return (
    <div className={className}>
      {items.map((item) => {
        return <SurveyLabeledRadiobutton key={item.name} {...item} />
      })}
    </div>
  )
}
