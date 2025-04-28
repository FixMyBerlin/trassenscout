import { FieldConfig } from "@/src/app/beteiligung-new/_shared/types"
import { AnyFieldMeta, DeepKeys } from "@tanstack/react-form"

type Props = {
  fieldMeta: Record<DeepKeys<FormData>, AnyFieldMeta>
  fieldsConfig: FieldConfig[]
}
export const FormErrorBox = ({ fieldMeta, fieldsConfig }: Props) => {
  const errors = Object.entries(fieldMeta)
    .filter(([key, value]) => fieldsConfig.find((f) => f.name === key)?.componentType === "form")
    .filter(([_, value]) => value.isTouched && value.errorMap?.onSubmit?.length)
    .map(([key, value]) => ({
      // @ts-expect-error we know form components have props.label tbd
      label: fieldsConfig.find((f) => f.name === key)?.props.label,
      message: value.errorMap.onSubmit[0].message,
      key,
    }))

  if (!errors.length) return null

  return (
    <div className="rounded-xl bg-red-50 p-4">
      <p>Bitte korrigieren Sie die folgenden Angaben:</p>
      {errors.map(({ key, label, message }) => (
        <p key={key} className="text-red-500">
          {label}: <em>{message}</em>
        </p>
      ))}
    </div>
  )
}
