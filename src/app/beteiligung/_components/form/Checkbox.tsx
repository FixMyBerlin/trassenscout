import { FieldWithErrorContainer } from "@/src/app/beteiligung/_components/form/ErrorContainer"
import { FieldError } from "@/src/app/beteiligung/_components/form/FieldErrror"
import { formClasses } from "@/src/app/beteiligung/_components/form/styles"
import { useFieldContext } from "@/src/app/beteiligung/_shared/hooks/form-context"
import { Checkbox, Description, Field } from "@headlessui/react"
import { CheckIcon } from "@heroicons/react/16/solid"
import clsx from "clsx"

type CheckboxProps = {
  description?: string
  label?: string
  itemDescription?: string
  itemLabel: string
  required: boolean
}

export const SurveyCheckbox = ({
  label,
  required,
  description,
  itemLabel,
  itemDescription,
}: CheckboxProps) => {
  const field = useFieldContext<boolean>()
  const hasError = field.state.meta.errors.length > 0
  return (
    <FieldWithErrorContainer hasError={hasError}>
      <div className="mb-4">
        {label && <p className={formClasses.fieldLabel}>{label}</p>}
        {description && (
          <p className={formClasses.fieldDescription} id={`${field.name}-hint`}>
            {description}
          </p>
        )}
      </div>
      <Field className="flex">
        <Checkbox
          as="div"
          id={field.name}
          checked={field.state.value}
          onChange={field.handleChange}
          onBlur={field.handleBlur}
          className="group flex w-full cursor-pointer items-center"
        >
          <div className="mr-3 flex h-5 items-center">
            <div className="relative">
              <span
                className={clsx(
                  "block h-4 w-4 rounded-sm border border-gray-300 transition-colors group-hover:border-gray-400",
                )}
              />
              <span className="absolute inset-0 h-4 w-4 rounded-sm bg-(--survey-primary-color) opacity-0 transition group-data-checked:opacity-100" />
              <CheckIcon className="absolute inset-0 size-4 fill-white opacity-0 group-data-checked:opacity-100" />
            </div>
          </div>
          {/* we do not use the simple pattern from the headless UI demos as we want the whole item to be clickable incl. label etc; we use p instead of Label from headless UI as Label breaks the hover for some reason */}
          <div className={formClasses.labelItemWrapper}>
            <p className={clsx(formClasses.fieldItemLabel)}>
              {itemLabel} {!required && "(optional)"}
            </p>
            {itemDescription && (
              <Description className={formClasses.fieldItemDescription}>
                {itemDescription}
              </Description>
            )}
          </div>
        </Checkbox>
      </Field>
      <FieldError field={field} />
    </FieldWithErrorContainer>
  )
}
