import React from "react"
import {
  ParticipationLabeledRadiobutton,
  ParticipationLabeledRadiobuttonProps,
} from "src/participation-frm7/components/form/ParticipationLabeledRadiobutton"

type Props = {
  items: ParticipationLabeledRadiobuttonProps[]
  className?: string
}

export const ParticipationLabeledRadiobuttonGroup: React.FC<Props> = ({ items, className }) => {
  return (
    <div className={className}>
      {items.map((item) => {
        return <ParticipationLabeledRadiobutton key={item.name} {...item} />
      })}
    </div>
  )
}
