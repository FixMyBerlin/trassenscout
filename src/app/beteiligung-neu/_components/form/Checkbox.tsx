import { FieldWithErrorContainer } from "@/src/app/beteiligung-neu/_components/form/ErrorContainer"
import { FieldError } from "@/src/app/beteiligung-neu/_components/form/FieldErrror"
import { formClasses } from "@/src/app/beteiligung-neu/_components/form/styles"
import { useFieldContext } from "@/src/app/beteiligung-neu/_shared/hooks/form-context"
import { Checkbox, Field } from "@headlessui/react"
import { CheckIcon } from "@heroicons/react/16/solid"
import clsx from "clsx"

type CheckboxProps = {
  description?: string
  label?: string
  itemDescription?: string
  itemLabel: string
}

export const SurveyCheckbox = ({
  label,
  description,
  itemLabel,
  itemDescription,
}: CheckboxProps) => {
  const field = useFieldContext<boolean>()
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
      <Field className="flex">
        <Checkbox
          as="button"
          id={field.name}
          checked={field.state.value}
          onChange={field.handleChange}
          onBlur={field.handleBlur}
          className="group flex h-full min-h-[2.5rem] w-full items-center hover:cursor-pointer"
        >
          <CheckIcon className="hidden size-4 fill-black group-data-[checked]:block" />
        </Checkbox>
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
          <p className={clsx(formClasses.fieldItemLabel)}>{itemLabel}</p>
          {itemDescription && <p className={formClasses.fieldItemDescription}>{itemDescription}</p>}
        </div>
      </Field>
      <FieldError field={field} />
    </FieldWithErrorContainer>
  )
}
