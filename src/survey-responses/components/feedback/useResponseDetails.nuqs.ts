import { parseAsInteger, useQueryState } from "nuqs"

export const useResponseDetails = () => {
  const [responseDetails, setResponseDetails] = useQueryState(
    "responseDetails",
    // parseAsInteger.withDefault(surveyResponses[0]?.id)
    // todo for some reason the responseDetails the default did not work like expected
    parseAsInteger.withDefault(0),
  )

  return { responseDetails, setResponseDetails }
}
