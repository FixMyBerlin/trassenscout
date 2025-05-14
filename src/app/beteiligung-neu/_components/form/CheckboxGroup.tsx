import { FieldWithErrorContainer } from "@/src/app/beteiligung-neu/_components/form/ErrorContainer"
import { FieldError } from "@/src/app/beteiligung-neu/_components/form/FieldErrror"
import { formClasses } from "@/src/app/beteiligung-neu/_components/form/styles"
import { useFieldContext } from "@/src/app/beteiligung-neu/_shared/hooks/form-context"
import { Checkbox, Description, Field } from "@headlessui/react"
import { CheckIcon } from "@heroicons/react/16/solid"
import clsx from "clsx"

type CheckboxProps = {
  description?: string
  label: string
  options: { key: string; label: string; description?: string }[]
}

export const SurveyCheckboxGroup = ({ label, description, options }: CheckboxProps) => {
  const field = useFieldContext<Array<string>>()
  const hasError = field.state.meta.errors.length > 0

  return (
    <FieldWithErrorContainer hasError={hasError}>
      <div className="mb-4">
        <p className={formClasses.fieldLabel}>{label}</p>
        {description && (
          <p className={formClasses.fieldDescription} id={`${field.name}-hint`}>
            {description}
          </p>
        )}
      </div>
      {options.map((option, i) => {
        return (
          <Field className="group" key={i}>
            <Checkbox
              as="div"
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
                    "relative h-4 w-4 rounded border border-gray-300 text-[var(--survey-primary-color)] transition-colors focus:ring-0 group-hover:border-gray-400",
                  )}
                />
                <span className="absolute h-4 w-4 rounded bg-[var(--survey-primary-color)] opacity-0 transition group-data-[checked]:opacity-100" />
                <CheckIcon className="absolute hidden size-4 fill-white group-data-[checked]:block" />
              </div>
              {/* we do not use the simple pattern from the headless UI demos as we want the whole item to be clickable incl. label etc; we use p instead of Label from headless UI as Label breaks the hover for some reason */}
              <div className={formClasses.labelItemWrapper}>
                <p className={clsx(formClasses.fieldItemLabel)}>{option.label}</p>
                {option.description && (
                  <Description className={formClasses.fieldItemDescription}>
                    {option.description}
                  </Description>
                )}
              </div>
            </Checkbox>
          </Field>
        )
      })}
      <FieldError field={field} />
    </FieldWithErrorContainer>
  )
}
