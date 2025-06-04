import { FieldConfig } from "@/src/app/beteiligung/_shared/types"
import { AnyFieldMeta, AnyFormApi, DeepKeys } from "@tanstack/react-form"

// we use fieldmeta instead of form.state.errorMap (for the errorbox and the blocking disbaling of goig to the next page because it is getting updated in another point in time; this works as we need it to work wit validators on both: form and field level

export const getFieldsErrors = ({
  fieldMeta,
  fields,
}: {
  fieldMeta: Record<DeepKeys<FormData>, AnyFieldMeta>
  fields: FieldConfig[]
}) => {
  const errors = Object.entries(fieldMeta)
    .filter(([key, value]) => fields.find((f) => f.name === key))
    .filter(([_, value]) => value.errorMap?.onSubmit?.length)
    .map(([key, value]) => ({
      // @ts-expect-error we know form components have props.label tbd
      label: fields.find((f) => f.name === key)?.props.label,
      message: value.errorMap.onSubmit[0].message,
      key,
    }))
  return errors
}

export const pageHasErrors = ({ form, fields }: { form: AnyFormApi; fields: FieldConfig[] }) => {
  const fieldsToValidate = fields.map((field) => field.name)
  // form.validateField() does not work as expected - it validates ALL fields of the form but only shows the errors in the fields of the respective fields

  fieldsToValidate?.forEach((name) => {
    form.validateField(name, "submit")
  })

  const errors = getFieldsErrors({ fieldMeta: form.state.fieldMeta, fields })
  // console.log({ errorMap: form.state.errorMap })
  // console.log({ error: form.state.errors })
  // console.log({ fieldsToValidate })

  return (
    // form.state.errorMap?.onSubmit &&
    // fieldsToValidate?.some((key) => key in form.state.errorMap.onSubmit)
    errors.length > 0
  )
}
