import clsx from "clsx"
import React from "react"
import {
  ParticipationLabeledCheckbox,
  TParticipationLabeledCheckbox,
} from "src/participation-frm7/components/form/ParticipationLabeledCheckbox"

type Props = {
  items: TParticipationLabeledCheckbox[]
  className?: string
}

export const ParticipationLabeledCheckboxGroup: React.FC<Props> = ({ items, className }) => {
  return (
    <div className={clsx(className, "space-y-2")}>
      {items.map((item, index) => {
        return <ParticipationLabeledCheckbox key={index} {...item} />
      })}
    </div>
  )
}
