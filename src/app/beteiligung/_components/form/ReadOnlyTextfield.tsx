import { FieldWithErrorContainer } from "@/src/app/beteiligung/_components/form/ErrorContainer"
import { FieldError } from "@/src/app/beteiligung/_components/form/FieldErrror"
import { formClasses } from "@/src/app/beteiligung/_components/form/styles"
import { Description, Field, Input, Label } from "@headlessui/react"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { useFieldContext } from "../../_shared/hooks/form-context"

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
  const searchParams = useSearchParams()

  useEffect(() => {
    const paramValue = searchParams?.get(queryId)
    if (paramValue !== null && field.state.value !== paramValue) {
      field.setValue(searchParams?.get(queryId) || "")
    }
  }, [field, searchParams, queryId])

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
          <Description className={formClasses.fieldDescription}>{description}</Description>
        </div>
        <Input
          id={field.name}
          name={field.name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          readOnly
          className="block w-full appearance-none rounded-md border border-gray-300 bg-gray-200 px-3 py-2 placeholder-gray-400 shadow-xs focus:border-(--survey-primary-color) focus:ring-(--survey-primary-color) focus:outline-hidden sm:text-sm"
          {...props}
        />
      </Field>
      <FieldError field={field} />
    </FieldWithErrorContainer>
  )
}
