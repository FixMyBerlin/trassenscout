const HTML_TAG_REGEX = /<[^>]+>/g

const MAX_LENGTH = 1000

export const toTemplateText = (value: string | null | undefined) => {
  if (!value) return ""

  const text = value.replace(HTML_TAG_REGEX, "").trim()
  if (text.length <= MAX_LENGTH) return text

  const cut = text.slice(0, MAX_LENGTH).trimEnd()
  const lastSpaceIndex = cut.search(/\s\S*$/)

  return `${lastSpaceIndex === -1 ? cut : cut.slice(0, lastSpaceIndex)}…`
}
