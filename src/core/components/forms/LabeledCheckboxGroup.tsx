import clsx from "clsx"
import React from "react"
import { LabeledCheckbox, LabeledCheckboxProps } from "./LabeledCheckbox"

type Props = {
  items: LabeledCheckboxProps[]
  className?: string
}

export const LabeledCheckboxGroup: React.FC<Props> = ({ items, className }) => {
  return (
    <div className={clsx(className, "space-y-3")}>
      {items.map((item) => {
        return <LabeledCheckbox key={item.name} {...item} />
      })}
    </div>
  )
}
