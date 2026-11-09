import { parseSearchWith, stringifySearchWith } from "@tanstack/react-router"

const parseSearch = parseSearchWith(JSON.parse)
// The parser quotes text like `1.10`, which would otherwise come back as the number 1.1.
const stringifySearchDefault = stringifySearchWith(JSON.stringify, JSON.parse)

function makeSearchPretty(searchString: string) {
  return searchString
    .replaceAll("%22", '"')
    .replaceAll("%2C", ",")
    .replaceAll("%27", "'")
    .replaceAll("%28", "(")
    .replaceAll("%29", ")")
    .replaceAll("%2F", "/")
    .replaceAll("%3A", ":")
    .replaceAll("%3B", ";")
    .replaceAll("%5B", "[")
    .replaceAll("%5D", "]")
    .replaceAll("%7B", "{")
    .replaceAll("%7D", "}")
}

export const routerSearch = {
  parse: parseSearch,
  stringify: (search: Record<string, unknown>) => makeSearchPretty(stringifySearchDefault(search)),
}
