import { clsx } from "clsx"
import { LabeledCheckbox, LabeledCheckboxProps } from "./LabeledCheckbox"

type Props = {
  label?: string
  optional?: boolean
  disabled?: boolean
  scope: string
  items: Omit<LabeledCheckboxProps, "scope">[]
  classLabelOverwrite?: string
  classNameItemWrapper?: string
}

export const LabeledCheckboxGroup = ({
  label,
  optional,
  disabled,
  scope,
  items,
  classLabelOverwrite,
  classNameItemWrapper,
}: Props) => {
  const itemsWithScope = items.map((i) => ({ ...i, scope }))

  return (
    <div>
      {label && (
        <p className={classLabelOverwrite || "mb-4 block text-sm font-medium text-gray-700"}>
          {label} {optional && <> (optional)</>}
        </p>
      )}
      <div className={clsx(classNameItemWrapper, "flex flex-col gap-3")}>
        {itemsWithScope.map((item) => {
          return <LabeledCheckbox key={item.value} {...item} disabled={disabled} />
        })}
      </div>
    </div>
  )
}
