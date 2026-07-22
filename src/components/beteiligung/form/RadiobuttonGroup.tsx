import { Description, Radio, RadioGroup } from "@headlessui/react"
import { twJoin } from "tailwind-merge"
import { FieldWithErrorContainer } from "@/src/components/beteiligung/form/ErrorContainer"
import {
  FieldError,
  getFieldA11yProps,
  getFieldDescriptionId,
} from "@/src/components/beteiligung/form/FieldErrror"
import { formClasses } from "@/src/components/beteiligung/form/styles"
import { useFieldContext } from "@/src/components/beteiligung/shared/hooks/form-context"

type Props = {
  description?: string
  required: boolean
  label: string
  options: { key: string; label: string; description?: string }[]
}

export const SurveyRadiobuttonGroup = ({ options, label, description, required }: Props) => {
  const field = useFieldContext<string>()
  // field.state.meta.isTouched && does not make sense here tbd
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
      <RadioGroup
        value={field.state.value}
        onChange={field.handleChange}
        aria-label={label}
        {...getFieldA11yProps({ description, fieldName: field.name, hasError })}
      >
        {options.map((option, i) => (
          <Radio
            key={i}
            id={`${field.name}[${i}]`}
            value={option.key}
            className={twJoin(
              "group flex w-full items-start hover:cursor-pointer",
              formClasses.choiceFocus,
            )}
          >
            <div className="flex h-full min-h-10 items-center">
              <div
                className={twJoin(
                  "relative size-4 cursor-pointer rounded-full border border-gray-300 transition-colors group-hover:border-gray-400",
                )}
              />
              <span className="absolute m-[2px] size-3 size-4 rounded-full border-4 border-(--survey-primary-color) opacity-0 transition group-data-checked:opacity-100" />
            </div>
            {/* we do not use the simple pattern from the headless UI demos as we want the whole item to be clickable incl. label etc; we use p instead of Label from headless UI as Label breaks the hover for some reason */}{" "}
            <div className={formClasses.labelItemWrapper}>
              <p className={twJoin(formClasses.fieldItemLabel)}>{option.label}</p>
              {option.description && (
                <Description className={formClasses.fieldItemDescription}>
                  {option.description}
                </Description>
              )}
            </div>
          </Radio>
        ))}
      </RadioGroup>
      <FieldError field={field} />
    </FieldWithErrorContainer>
  )
}
