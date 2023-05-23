import clsx from "clsx"
import React from "react"
import { LabeledRadiobutton, LabeledRadiobuttonProps } from "./LabeledRadiobutton"

type Props = {
  items: LabeledRadiobuttonProps[]
  groupLabel?: string
  optional?: boolean
  className?: string
}

export const LabeledRadiobuttonGroup: React.FC<Props> = ({
  items,
  groupLabel,
  optional,
  className,
}) => {
  return (
    <div>
      <p className="mb-4 block text-sm font-medium text-gray-700">
        {groupLabel} {optional && <> (optional)</>}
      </p>
      <div className={clsx(className, "space-y-3")}>
        {items.map((item) => {
          return <LabeledRadiobutton key={item.name} {...item} />
        })}
      </div>
    </div>
  )
}
