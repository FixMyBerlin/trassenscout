import { isDev } from "@/src/core/utils/isEnv"
import { clsx } from "clsx"
import { Fragment } from "react"
import { FormattedMessage } from "react-intl"
import { proseClasses } from "../text"

type Props = {
  formError: any // TODO buil proper type
}

/** Turn formError (string or Error-like) into a single display string. Avoids showing raw "Error". */
function getFormErrorDisplayValue(formError: any) {
  if (formError == null) return ""
  if (typeof formError === "string") return formError
  const msg = formError?.message
  if (typeof msg === "string" && msg.length > 0) return msg
  const str = formError?.toString?.()
  if (str && str !== "Error") return str
  return "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
}

// See also https://github.com/blitz-js/blitz/issues/4059
export const FormError = ({ formError }: Props) => {
  if (!formError) return null

  return (
    <div role="alert" className={clsx(proseClasses, "rounded-sm bg-red-50 px-2 py-1 text-red-800")}>
      {formError.name === "ZodError" ? (
        <>
          {(formError?.issues || formError?.message || []).map((error: any) => (
            <Fragment key={error.message}>
              <code className="text-red-800">{error.path[0]}</code>: {error.message}
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
          <FormattedMessage
            id={getFormErrorDisplayValue(formError).replaceAll("\n", "")}
            defaultMessage={getFormErrorDisplayValue(formError)}
          />
        </span>
      )}
    </div>
  )
}
