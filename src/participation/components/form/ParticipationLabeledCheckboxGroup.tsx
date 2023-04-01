import clsx from "clsx"
import React from "react"
import {
  ParticipationLabeledCheckbox,
  TParticipationLabeledCheckbox,
} from "./ParticipationLabeledCheckbox"

type Props = {
  items: TParticipationLabeledCheckbox[]
  className?: string
}

export const ParticipationLabeledCheckboxGroup: React.FC<Props> = ({ items, className }) => {
  return (
    <div className={clsx(className, "space-y-8")}>
      {items.map((item, index) => {
        return <ParticipationLabeledCheckbox key={index} {...item} />
      })}
    </div>
  )
}
