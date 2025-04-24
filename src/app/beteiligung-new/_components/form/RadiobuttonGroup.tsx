import { FieldError } from "@/src/app/beteiligung-new/_components/form/FieldErrror"
import { formClasses } from "@/src/app/beteiligung-new/_components/form/styles"
import { useFieldContext } from "@/src/app/beteiligung-new/_shared/hooks/form-context"
import { Radio, RadioGroup } from "@headlessui/react"
import { clsx } from "clsx"

type Props = {
  description?: string
  label: string
  options: { key: string; label: string; description?: string }[]
  className?: string
}

export const SurveyRadiobuttonGroup = ({ options, className, label, description }: Props) => {
  const field = useFieldContext<string>()
  // field.state.meta.isTouched && does not make sense here tbd
  const hasError = field.state.meta.errors.length > 0

  return (
    <div className={clsx("m-2 w-full gap-2 p-2", hasError && "rounded bg-red-50")}>
      <div className="mx-auto w-full max-w-md">
        <p className={formClasses.fieldLabel}>{label}</p>
        {description && (
          <p className={formClasses.fieldDescription} id={`${field.name}-hint`}>
            {description}
          </p>
        )}
        <FieldError field={field} />
        <div className={clsx("w-full", className)}>
          <div className="mx-auto w-full max-w-md">
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
                        "relative h-4 w-4 cursor-pointer rounded-full border border-gray-300 focus:ring-0 group-hover:border-gray-400",
                      )}
                    />
                    <span className="absolute m-[2px] size-4 h-3 w-3 rounded-full border-4 border-[var(--survey-primary-color)] opacity-0 transition group-data-[checked]:opacity-100" />
                  </div>
                  {/* for some reason Headless UI Label and Description component interfer with the hover and other inherited classes */}
                  <div className={formClasses.labelItemWrapper}>
                    <p className={clsx(formClasses.fieldItemLabel)}>{option.label}</p>
                    {option.description && (
                      <p className={formClasses.fieldItemDescription}>{option.description}</p>
                    )}
                  </div>
                </Radio>
              ))}
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  )
}
