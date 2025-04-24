import { FieldError } from "@/src/app/beteiligung-new/_components/form/FieldErrror"
import { formClasses } from "@/src/app/beteiligung-new/_components/form/styles"
import { useFieldContext } from "@/src/app/beteiligung-new/_shared/hooks/form-context"
import { Checkbox, Field } from "@headlessui/react"
import { CheckIcon } from "@heroicons/react/16/solid"
import clsx from "clsx"

type CheckboxProps = {
  description?: string
  label: string
  options: { key: string; label: string; description?: string }[]
  className?: string
}

export const SurveyCheckboxGroup = ({ label, description, options, className }: CheckboxProps) => {
  const field = useFieldContext<Array<string>>()
  const hasError = field.state.meta.errors.length > 0

  return (
    <div className={clsx("m-2 p-2", hasError && "rounded bg-red-50", className)}>
      <p className={formClasses.fieldLabel}>{label}</p>
      {description && (
        <p className={formClasses.fieldDescription} id={`${field.name}-hint`}>
          {description}
        </p>
      )}
      {options.map((option, i) => {
        return (
          <Field className="group" key={i}>
            <Checkbox
              as="button"
              id={`${field.name}[${i}]`}
              checked={field.state.value.includes(option.key)}
              onChange={(isChecked) => {
                const updatedValue = isChecked
                  ? [...field.state.value, option.key]
                  : field.state.value.filter((v) => v !== option.key)
                field.handleChange(updatedValue)
              }}
              className="group flex h-full min-h-[2.5rem] w-full items-center hover:cursor-pointer"
            >
              <div className="flex h-full min-h-[2.5rem] items-center">
                <span
                  className={clsx(
                    "group-hover:border-gray-40 relative h-4 w-4 rounded border border-gray-300 text-[var(--survey-primary-color)] focus:ring-0",
                  )}
                />
                <span className="absolute h-4 w-4 rounded bg-[var(--survey-primary-color)] opacity-0 transition group-data-[checked]:opacity-100" />
                <CheckIcon className="absolute hidden size-4 fill-white group-data-[checked]:block" />
              </div>
              {/* for some reason Headless UI Label and Description component interfer with the hover and other inherited classes */}
              <div className={formClasses.labelItemWrapper}>
                <p className={clsx(formClasses.fieldItemLabel)}>{option.label}</p>
                {option.description && (
                  <p className={formClasses.fieldItemDescription}>{option.description}</p>
                )}
              </div>
            </Checkbox>
          </Field>
        )
      })}
      <FieldError field={field} />
    </div>
  )
}
