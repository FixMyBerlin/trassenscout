import clsx from "clsx"
import { Fragment } from "react"
import { FormattedMessage } from "react-intl"
import { isDev } from "src/core/utils"
import { proseClasses } from "../text"

type Props = {
  formError: any // TODO buil proper type
}

// See also https://github.com/blitz-js/blitz/issues/4059
export const FormError = ({ formError }: Props) => {
  if (!formError) return null

  return (
    <div role="alert" className={clsx(proseClasses, "rounded bg-red-50 px-2 py-1 text-red-800")}>
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
          {...(isDev ? { "data-message-id": formError.toString().replaceAll("\n", "") } : {})}
          className="font-mono text-sm leading-tight"
        >
          <FormattedMessage
            id={formError.toString().replaceAll("\n", "")}
            defaultMessage={formError}
          />
        </span>
      )}
    </div>
  )
}
