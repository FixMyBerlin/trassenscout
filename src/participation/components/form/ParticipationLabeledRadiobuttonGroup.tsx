import clsx from "clsx"
import React from "react"
import {
  ParticipationLabeledRadiobutton,
  ParticipationLabeledRadiobuttonProps,
} from "./ParticipationLabeledRadiobutton"

type Props = {
  items: ParticipationLabeledRadiobuttonProps[]
  className?: string
}

export const ParticipationLabeledRadiobuttonGroup: React.FC<Props> = ({ items, className }) => {
  return (
    <div className={clsx(className, "space-y-8")}>
      {items.map((item) => {
        return <ParticipationLabeledRadiobutton key={item.name} {...item} />
      })}
    </div>
  )
}
