import clsx from "clsx"
import { FormattedMessage } from "react-intl"
import { isDev } from "src/core/utils"
import { proseClasses } from "../text"

type Props = {
  formError: any // TODO buil proper type
}

// See also https://github.com/blitz-js/blitz/issues/4059
export const FormError: React.FC<Props> = ({ formError }) => {
  if (!formError) return null

  return (
    <div role="alert" className={clsx(proseClasses, "rounded bg-pink-50 py-1 px-2 text-pink-800")}>
      {formError.name === "ZodError" ? (
        <>
          {(formError?.issues || formError?.message || []).map((error: any) => (
            <>
              <code className="text-pink-800">{error.path[0]}</code>: {error.message}
              <br />
            </>
          ))}
        </>
      ) : (
        <span {...(isDev ? { "data-message-id": formError.toString().replaceAll("\n", "") } : {})}>
          <FormattedMessage
            id={formError.toString().replaceAll("\n", "")}
            defaultMessage={formError}
          />
        </span>
      )}
    </div>
  )
}
