import { useStore } from "@tanstack/react-form"
import { clsx } from "clsx"
import { Fragment } from "react"
import { translateServerError } from "@/src/components/core/components/forms/errorMessageTranslations"
import { useFormShellState } from "@/src/components/core/components/forms/hooks/useFormShellState"
import { proseClasses } from "@/src/components/core/components/text/prose"
import { isDev } from "@/src/components/core/utils/isEnv"

type Props = {
  formError: unknown
}

function isZodError(
  formError: unknown,
): formError is { name: "ZodError"; issues?: { path: unknown[]; message: string }[] } {
  return (
    formError !== null &&
    typeof formError === "object" &&
    "name" in formError &&
    formError.name === "ZodError"
  )
}

/** Turn formError (string or Error-like) into a single display string. Avoids showing raw "Error". */
function getFormErrorDisplayValue(formError: unknown) {
  if (formError == null) return ""
  if (typeof formError === "string") return formError
  if (typeof formError === "object" && "message" in formError) {
    const msg = formError.message
    if (typeof msg === "string" && msg.length > 0) return msg
  }
  if (
    typeof formError === "object" &&
    formError !== null &&
    "toString" in formError &&
    typeof formError.toString === "function"
  ) {
    const str = formError.toString()
    if (str && str !== "Error") return str
  }
  return "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
}

// See also https://github.com/blitz-js/blitz/issues/4059
export const FormError = ({ formError }: Props) => {
  const { form } = useFormShellState()
  const hasTanStackErrors = useStore(
    form.store,
    (state) =>
      (state.errors?.length ?? 0) > 0 ||
      Object.keys(state.errorMap ?? {}).length > 0 ||
      Object.values(state.fieldMeta).some((meta) => {
        if (!meta) return false
        if ((meta.errors?.length ?? 0) > 0) return true
        if (meta.errorMap) {
          for (const errs of Object.values(meta.errorMap)) {
            if (Array.isArray(errs) && errs.length > 0) return true
          }
        }
        return false
      }),
  )

  if (!formError && !hasTanStackErrors) return null

  return (
    <div role="alert" className={clsx(proseClasses, "rounded-sm bg-red-50 px-2 py-1 text-red-800")}>
      {hasTanStackErrors ? (
        <p className="text-sm leading-tight">Bitte korrigieren Sie Ihre Angaben.</p>
      ) : formError ? (
        isZodError(formError) ? (
          <>
            {(formError.issues ?? []).map((error) => (
              <Fragment key={error.message}>
                <code>{String(error.path[0])}</code>: {error.message}
                <br />
              </Fragment>
            ))}
          </>
        ) : (
          <span
            {...(isDev
              ? { "data-message-id": getFormErrorDisplayValue(formError).replaceAll("\n", "") }
              : {})}
            className="font-mono text-sm leading-tight"
          >
            {translateServerError(getFormErrorDisplayValue(formError))}
          </span>
        )
      ) : null}
    </div>
  )
}
