import { parseAsArrayOf, parseAsInteger, useQueryState } from "nuqs"

export const useMapSelection = (defaultIds: number[]) => {
  const [mapSelection, setMapSelection] = useQueryState(
    "selectedResponses",
    parseAsArrayOf(parseAsInteger).withDefault(defaultIds),
  )
  return { mapSelection, setMapSelection }
}
