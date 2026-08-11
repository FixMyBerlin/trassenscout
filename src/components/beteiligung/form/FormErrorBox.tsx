import { XCircleIcon } from "@heroicons/react/20/solid"
import { AnyFieldMeta, DeepKeys } from "@tanstack/react-form"
import { useEffect, useRef } from "react"
import { FieldWithErrorContainer } from "@/src/components/beteiligung/form/ErrorContainer"
import { FieldConfig } from "@/src/components/beteiligung/shared/types"
import { getFieldsErrors } from "@/src/components/beteiligung/shared/utils/pageHasErrors"

type Props = {
  fieldMeta: Record<DeepKeys<FormData>, AnyFieldMeta>
  allCurrentFieldsOfPage: FieldConfig[]
}
export const FormErrorBox = ({ fieldMeta, allCurrentFieldsOfPage }: Props) => {
  const errors = getFieldsErrors({ fieldMeta, fields: allCurrentFieldsOfPage })
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const previousErrorsLengthRef = useRef(0)

  useEffect(
    function focusErrorSummaryWhenErrorsAppear() {
      // Only steal focus when the summary first appears (e.g. after Next/Submit).
      // Re-focusing on every errors.length change breaks typing while correcting fields.
      if (errors.length > 0 && previousErrorsLengthRef.current === 0) {
        errorSummaryRef.current?.focus()
      }
      previousErrorsLengthRef.current = errors.length
    },
    [errors.length],
  )

  if (!errors.length) return null

  return (
    <>
      <FieldWithErrorContainer className="flex gap-2" hasError>
        <XCircleIcon className="size-6 shrink-0 text-red-500" />
        <div ref={errorSummaryRef} role="alert" tabIndex={-1}>
          <p className="text-sm text-red-800">Bitte korrigieren Sie die folgenden Angaben:</p>
          <ul>
            {errors.map(({ key, label, message }) => (
              <li key={key} className="text-sm text-red-800">
                {label}: <span className="font-semibold">{message}</span>
              </li>
            ))}
          </ul>
        </div>
      </FieldWithErrorContainer>
    </>
  )
}
