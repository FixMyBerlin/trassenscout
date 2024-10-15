import clsx from "clsx"

type LabeledInputRadioCheckboxProps = {
  item: { value: string; label: string }
  checked: boolean | undefined
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  classLabelOverwrite?: string
  classNameItemWrapper?: string
  name: string
  type: "radio" | "checkbox"
}

export const LabeledInputRadioCheckbox = ({
  item,
  checked,
  onChange,
  classLabelOverwrite,
  classNameItemWrapper,
  name,
  type,
}: LabeledInputRadioCheckboxProps) => {
  return (
    <div className={clsx(classNameItemWrapper)}>
      <label className={classLabelOverwrite || "block text-sm font-medium text-gray-700"}>
        <div className="flex h-5 cursor-pointer break-inside-avoid items-center justify-start">
          <input
            type={type}
            name={name}
            value={item.value}
            checked={checked}
            onChange={onChange}
            className="mr-1 h-4 w-4 cursor-pointer border-gray-300 leading-none text-blue-600 focus:ring-blue-500"
          />
          {item.label}
        </div>
      </label>
    </div>
  )
}
