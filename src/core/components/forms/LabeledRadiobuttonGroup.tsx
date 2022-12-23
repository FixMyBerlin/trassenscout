import clsx from "clsx"
import React from "react"
import { LabeledRadiobutton, LabeledRadiobuttonProps } from "./LabeledRadiobutton"

type Props = {
  items: LabeledRadiobuttonProps[]
  className?: string
}

export const LabeledRadiobuttonGroup: React.FC<Props> = ({ items, className }) => {
  return (
    <div className={clsx(className, "space-y-3")}>
      {items.map((item) => {
        return <LabeledRadiobutton key={item.name} {...item} />
      })}
    </div>
  )
}
