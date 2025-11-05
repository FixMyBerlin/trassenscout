import { clsx } from "clsx"
import { LabeledRadiobutton, LabeledRadiobuttonProps } from "./LabeledRadiobutton"

export type LabeledRadiobuttonGroupProps = {
  label?: string
  optional?: boolean
  disabled?: boolean
  scope: string
  items: Omit<LabeledRadiobuttonProps, "scope">[]
  classLabelOverwrite?: string
  classNameItemWrapper?: string
  /** Callback fired when the value changes */
  onChange?: (value: string) => void
  /** Help text displayed below the radio button group */
  help?: string | React.ReactNode
}

export const LabeledRadiobuttonGroup = ({
  label,
  optional,
  disabled,
  scope,
  items,
  classLabelOverwrite,
  classNameItemWrapper,
  onChange,
  help,
}: LabeledRadiobuttonGroupProps) => {
  const itemsWithScope = items.map((i) => ({
    ...i,
    scope,
    // Pass onChange to register, not as input prop
    _onChange: onChange,
  }))

  return (
    <div>
      {label && (
        <p className={classLabelOverwrite || "mb-4 block text-sm font-medium text-gray-700"}>
          {label} {optional && <> (optional)</>}
        </p>
      )}
      <div className={clsx(classNameItemWrapper || "space-y-3")}>
        {itemsWithScope.map((item) => {
          return <LabeledRadiobutton key={item.value} {...item} disabled={disabled} />
        })}
      </div>
      {Boolean(help) && <p className="mt-2 text-sm text-gray-500">{help}</p>}
    </div>
  )
}
