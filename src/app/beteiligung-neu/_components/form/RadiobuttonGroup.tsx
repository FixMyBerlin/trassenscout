import { FieldWithErrorContainer } from "@/src/app/beteiligung-neu/_components/form/ErrorContainer"
import { FieldError } from "@/src/app/beteiligung-neu/_components/form/FieldErrror"
import { formClasses } from "@/src/app/beteiligung-neu/_components/form/styles"
import { useFieldContext } from "@/src/app/beteiligung-neu/_shared/hooks/form-context"
import { Description, Radio, RadioGroup } from "@headlessui/react"
import { clsx } from "clsx"

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
          <p className={formClasses.fieldDescription} id={`${field.name}-hint`}>
            {description}
          </p>
        )}
      </div>
      <RadioGroup value={field.state.value} onChange={field.handleChange} aria-label={label}>
        {options.map((option, i) => (
          <Radio
            key={i}
            id={`${field.name}[${i}]`}
            value={option.key}
            className="group flex w-full items-start hover:cursor-pointer"
          >
            <div className="flex h-full min-h-[2.5rem] items-center">
              <div
                className={clsx(
                  "relative h-4 w-4 cursor-pointer rounded-full border border-gray-300 transition-colors focus:ring-0 group-hover:border-gray-400",
                )}
              />
              <span className="absolute m-[2px] size-4 h-3 w-3 rounded-full border-4 border-[var(--survey-primary-color)] opacity-0 transition group-data-[checked]:opacity-100" />
            </div>
            {/* we do not use the simple pattern from the headless UI demos as we want the whole item to be clickable incl. label etc; we use p instead of Label from headless UI as Label breaks the hover for some reason */}{" "}
            <div className={formClasses.labelItemWrapper}>
              <p className={clsx(formClasses.fieldItemLabel)}>{option.label}</p>
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
