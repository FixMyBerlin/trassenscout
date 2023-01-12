import { formatZodError } from "blitz"
import { FormattedMessage } from "react-intl"
import { isDev } from "src/core/utils"

type Props = { formError: string | null }

export const FormError: React.FC<Props> = ({ formError }) => {
  if (!formError) return null

  // For some reason, zod errors from the server are strings.
  // They cannot be parsed as JSON. Therefore we make this fiddely dance
  // to extract the information from them. THere has to be a nicer way than this…
  let zodErrors: string[] | null = null
  if (formError.startsWith("ZodError:")) {
    const errorObject = JSON.parse(formError.replace("ZodError: ", ""))
    if (errorObject && errorObject[0]?.message) {
      zodErrors = errorObject.map((e: any) => `${e?.path?.join(" ")}: ${e.message}`)
    }
  }

  if (isDev) {
    console.log(
      "FormError:",
      { formError, type: typeof formError },
      { parsedZodErrors: zodErrors, type: typeof zodErrors }
    )
  }

  return (
    <div
      role="alert"
      className="rounded bg-red-50 py-1 px-2 text-red-700"
      data-message-id={formError.replaceAll("\n", "")}
    >
      {zodErrors && Boolean(zodErrors?.length) ? (
        <>
          {zodErrors.map((e) => (
            <>
              {e}
              <br />
            </>
          ))}
        </>
      ) : (
        <FormattedMessage id={formError.replaceAll("\n", "")} defaultMessage={formError} />
      )}
    </div>
  )
}
