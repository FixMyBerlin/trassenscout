import { clsx } from "clsx"
import { useFormContext } from "react-hook-form"
import { SurveyLabeledRadiobutton, SurveyLabeledRadiobuttonProps } from "./SurveyLabeledRadiobutton"

type Props = {
  items: SurveyLabeledRadiobuttonProps[]
  className?: string
}

export const SurveyLabeledRadiobuttonGroup = ({ items, className }: Props) => {
  const {
    formState: { errors },
  } = useFormContext()
  // @ts-expect-error
  const groupHasError = Boolean(errors[items[0].scope])
  return (
    <div className={clsx(className, groupHasError && "-mx-2 rounded-lg bg-red-50 px-2")}>
      {items.map((item) => {
        return <SurveyLabeledRadiobutton key={item.name} {...item} />
      })}
    </div>
  )
}
