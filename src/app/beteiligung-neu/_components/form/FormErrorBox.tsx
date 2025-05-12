import { FieldWithErrorContainer } from "@/src/app/beteiligung-neu/_components/form/ErrorContainer"
import { FieldConfig } from "@/src/app/beteiligung-neu/_shared/types"
import { getFieldsErrors } from "@/src/app/beteiligung-neu/_shared/utils/pageHasErrors"
import { AnyFieldMeta, DeepKeys } from "@tanstack/react-form"

type Props = {
  fieldMeta: Record<DeepKeys<FormData>, AnyFieldMeta>
  fields: FieldConfig[]
}
export const FormErrorBox = ({ fieldMeta, fields }: Props) => {
  const errors = getFieldsErrors({ fieldMeta, fields })

  if (!errors.length) return null

  return (
    <FieldWithErrorContainer hasError>
      <p>Bitte korrigieren Sie die folgenden Angaben:</p>
      {errors.map(({ key, label, message }) => (
        <p key={key} className="text-red-500">
          {label}: <em>{message}</em>
        </p>
      ))}
    </FieldWithErrorContainer>
  )
}
