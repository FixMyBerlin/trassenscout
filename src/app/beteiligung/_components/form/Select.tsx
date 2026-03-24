import { FieldWithErrorContainer } from "@/src/app/beteiligung/_components/form/ErrorContainer"
import { FieldError } from "@/src/app/beteiligung/_components/form/FieldErrror"
import { formClasses } from "@/src/app/beteiligung/_components/form/styles"
import { Description, Field, Label, Select } from "@headlessui/react"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useFieldContext } from "../../_shared/hooks/form-context"

type SelectProps = {
  description?: string
  readOnly?: boolean
  required: boolean
  label: string
  queryId?: string
  placeholder?: string
  options: { key: string; label: string }[]
}

export const SurveySelect = ({
  description,
  readOnly,
  label,
  options,
  placeholder,
  required,
  queryId,
}: SelectProps) => {
  const field = useFieldContext<string>()
  const hasError = field.state.meta.errors.length > 0

  // if queryId is set, we update the value of the input field with the value of the query parameter
  // in Survey[surveyName].tsx we update the query parameter to include the [queryId]
  // here we get the value of [queryId] from the url, display it and set the value of the input field
  // the queryId is configured in the field of the respective config file

  const searchParams = useSearchParams()
  useEffect(() => {
    if (queryId) {
      const paramValue = searchParams?.get(queryId)
      if (paramValue) {
        const isValidOption = options.some((option) => option.key === paramValue)
        const newValue = isValidOption ? paramValue : "unknown"
        if (field.state.value !== newValue) {
          field.setValue(newValue)
        }
      }
    }
  }, [field, searchParams, queryId, options])

  return (
    <FieldWithErrorContainer hasError={hasError}>
      <Field>
        <div className="mb-4">
          <Label className={formClasses.fieldLabel}>
            {label} {!required && "(optional)"}
          </Label>
          <Description className={formClasses.fieldDescription}>{description}</Description>
        </div>
        <Select
          disabled={readOnly}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-label={label}
          className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-xs focus:border-(--survey-primary-color) focus:ring-(--survey-primary-color) focus:outline-hidden data-disabled:bg-gray-200 sm:text-sm"
        >
          {placeholder && (
            <option disabled value="">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>
      <FieldError field={field} />
    </FieldWithErrorContainer>
  )
}
