import { Description, Field, Input, Label } from "@headlessui/react"
import { useSearch } from "@tanstack/react-router"
import { useEffect } from "react"
import { FieldWithErrorContainer } from "@/src/components/beteiligung/form/ErrorContainer"
import {
  FieldError,
  getFieldA11yProps,
  getFieldDescriptionId,
} from "@/src/components/beteiligung/form/FieldErrror"
import { formClasses } from "@/src/components/beteiligung/form/styles"
import { useFieldContext } from "@/src/components/beteiligung/shared/hooks/form-context"

type ReadonlyTextfieldProps = {
  description?: string
  required: boolean
  label: string
  queryId: string
} & React.InputHTMLAttributes<HTMLInputElement>

export const SurveyReadonlyTextfield = ({
  description,
  label,
  required,
  queryId,
  ...props
}: ReadonlyTextfieldProps) => {
  const field = useFieldContext<string>()
  const hasError = field.state.meta.errors.length > 0
  const search = useSearch({ from: "/beteiligung/$surveySlug/" })

  useEffect(() => {
    const paramValue = search[queryId]
    if (paramValue !== undefined && field.state.value !== paramValue) {
      field.setValue(paramValue || "")
    }
  }, [field, search, queryId])

  // in Survey[surveyName].tsx we update the query parameter to include the [queryId]
  // here we get the value of [queryId] from the url, display it and set the value of the input field
  // the queryId is configured in the field of the respective config file

  return (
    <FieldWithErrorContainer hasError={hasError}>
      <Field>
        <div className="mb-4">
          <Label className={formClasses.fieldLabel}>
            {label} {!required && "(optional)"}
          </Label>
          {description && (
            <Description
              id={getFieldDescriptionId(field.name)}
              className={formClasses.fieldDescription}
            >
              {description}
            </Description>
          )}
        </div>
        <Input
          id={field.name}
          name={field.name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          readOnly
          className={`block w-full appearance-none rounded-md border border-gray-300 bg-gray-100 px-3 py-2 placeholder-gray-600 shadow-xs sm:text-sm ${formClasses.fieldFocus}`}
          {...getFieldA11yProps({ description, fieldName: field.name, hasError })}
          {...props}
        />
      </Field>
      <FieldError field={field} />
    </FieldWithErrorContainer>
  )
}
