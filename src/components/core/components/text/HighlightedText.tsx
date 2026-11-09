import { normalizeSearchterm } from "@/src/components/core/utils/normalizeSearchterm"

type Props = {
  text: string
  searchterm: string | undefined
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const HighlightedText = ({ text, searchterm }: Props) => {
  const cleanedSearchterm = normalizeSearchterm(searchterm ?? "")
  if (!cleanedSearchterm) return text

  // The capture group keeps the matches in the result, always at odd indexes.
  const parts = text.split(new RegExp(`(${escapeRegExp(cleanedSearchterm)})`, "gi"))

  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark key={index} className="bg-yellow-200 text-inherit">
        {part}
      </mark>
    ) : (
      part
    ),
  )
}
