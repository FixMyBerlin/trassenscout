import { clsx } from "clsx"
import { SurveyLabeledCheckbox, TSurveyLabeledCheckbox } from "./SurveyLabeledCheckbox"

type Props = {
  items: TSurveyLabeledCheckbox[]
  className?: string
}

export const SurveyLabeledCheckboxGroup = ({ items, className }: Props) => {
  return (
    <div className={clsx(className, "space-y-2")}>
      {items.map((item, index) => {
        return <SurveyLabeledCheckbox key={index} {...item} />
      })}
    </div>
  )
}
