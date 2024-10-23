import clsx from "clsx"

type LabeledInputRadioCheckboxProps = {
  // todo form props...
  disabled?: boolean
  item: { value: string; label: string }
  checked: boolean | undefined
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  classLabelOverwrite?: string
  classNameItemWrapperOverwrite?: string
  name: string
  type: "radio" | "checkbox"
}

export const LabeledInputRadioCheckbox = ({
  disabled,
  item,
  checked,
  onChange,
  classLabelOverwrite,
  classNameItemWrapperOverwrite: classNameItemWrapper,
  name,
  type,
}: LabeledInputRadioCheckboxProps) => {
  return (
    <div className={clsx(classNameItemWrapper)}>
      <label
        className={
          classLabelOverwrite ||
          "gray-700 block text-sm font-medium leading-none lg:whitespace-nowrap"
        }
      >
        <div
          className={clsx(
            classNameItemWrapper || "flex h-5 items-center justify-start",
            "cursor-pointer",
          )}
        >
          <input
            disabled={disabled}
            type={type}
            name={name}
            value={item.value}
            checked={checked}
            onChange={onChange}
            className={clsx(
              type === "checkbox" && "rounded-sm",
              "mr-2 h-4 w-4 cursor-pointer border-gray-300 leading-none text-blue-500 focus:ring-blue-500",
            )}
          />
          {item.label}
        </div>
      </label>
    </div>
  )
}
