import { FieldWithErrorContainer } from "@/src/app/beteiligung/_components/form/ErrorContainer"
import { FieldConfig } from "@/src/app/beteiligung/_shared/types"
import { getFieldsErrors } from "@/src/app/beteiligung/_shared/utils/pageHasErrors"
import { XCircleIcon } from "@heroicons/react/20/solid"
import { AnyFieldMeta, DeepKeys } from "@tanstack/react-form"

type Props = {
  fieldMeta: Record<DeepKeys<FormData>, AnyFieldMeta>
  allCurrentFieldsOfPage: FieldConfig[]
}
export const FormErrorBox = ({ fieldMeta, allCurrentFieldsOfPage }: Props) => {
  const errors = getFieldsErrors({ fieldMeta, fields: allCurrentFieldsOfPage })
  if (!errors.length) return null

  return (
    <>
      <FieldWithErrorContainer className="flex gap-2" hasError>
        <XCircleIcon className="h-6 w-6 shrink-0 text-red-500" />
        <ul>
          <p className="text-sm text-red-800">Bitte korrigieren Sie die folgenden Angaben:</p>
          {errors.map(({ key, label, message }) => (
            <li key={key} id={key + " Hint"} className="text-sm text-red-800">
              {label}: <span className="font-semibold">{message}</span>
            </li>
          ))}
        </ul>
      </FieldWithErrorContainer>
    </>
  )
}
