import clsx from "clsx"
import React from "react"
import { SurveyLabeledCheckbox, TSurveyLabeledCheckbox } from "./SurveyLabeledCheckbox"

type Props = {
  items: TSurveyLabeledCheckbox[]
  className?: string
}

export const SurveyLabeledCheckboxGroup: React.FC<Props> = ({ items, className }) => {
  return (
    <div className={clsx(className, "space-y-2")}>
      {items.map((item, index) => {
        return <SurveyLabeledCheckbox key={index} {...item} />
      })}
    </div>
  )
}
