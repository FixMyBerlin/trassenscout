import { Checkbox, Description, Field } from "@headlessui/react"
import { CheckIcon } from "@heroicons/react/16/solid"
import { twJoin } from "tailwind-merge"
import { FieldWithErrorContainer } from "@/src/components/beteiligung/form/ErrorContainer"
import {
  FieldError,
  getFieldA11yProps,
  getFieldDescriptionId,
} from "@/src/components/beteiligung/form/FieldErrror"
import { formClasses } from "@/src/components/beteiligung/form/styles"
import { useFieldContext } from "@/src/components/beteiligung/shared/hooks/form-context"

type CheckboxProps = {
  required: boolean
  description?: string
  label: string
  options: { key: string; label: string; description?: string }[]
}

export const SurveyCheckboxGroup = ({ label, description, options, required }: CheckboxProps) => {
  const field = useFieldContext<Array<string>>()
  const hasError = field.state.meta.errors.length > 0

  return (
    <FieldWithErrorContainer hasError={hasError}>
      <div className="mb-4">
        <p className={formClasses.fieldLabel}>
          {label} {!required && "(optional)"}
        </p>
        {description && (
          <p className={formClasses.fieldDescription} id={getFieldDescriptionId(field.name)}>
            {description}
          </p>
        )}
      </div>
      <div
        role="group"
        aria-label={label}
        {...getFieldA11yProps({ description, fieldName: field.name, hasError })}
      >
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
                className={twJoin(
                  "group flex h-full min-h-10 w-full items-center hover:cursor-pointer",
                  formClasses.choiceFocus,
                )}
              >
                <div className="flex h-full min-h-10 items-center">
                  <span
                    className={twJoin(
                      "relative size-4 rounded-sm border border-gray-300 text-(--survey-primary-color) transition-colors group-hover:border-gray-400",
                    )}
                  />
                  <span className="absolute size-4 rounded-sm bg-(--survey-primary-color) opacity-0 transition group-data-checked:opacity-100" />
                  <CheckIcon className="absolute hidden size-4 fill-white group-data-checked:block" />
                </div>
                {/* we do not use the simple pattern from the headless UI demos as we want the whole item to be clickable incl. label etc; we use p instead of Label from headless UI as Label breaks the hover for some reason */}
                <div className={formClasses.labelItemWrapper}>
                  <p className={twJoin(formClasses.fieldItemLabel)}>{option.label}</p>
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
      </div>
      <FieldError field={field} />
    </FieldWithErrorContainer>
  )
}
