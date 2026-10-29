// Deeper replies share the last bar, so the nesting stays readable and bounded.
const MAX_QUOTE_DEPTH = 3

// Groups mail lines by quote depth without the markers; a ">" right before text (">2000") is content.
export function splitEmailQuotes(text: string) {
  const blocks: { depth: number; lines: string[] }[] = []

  // Apple Mail leaves U+FFFC in the text where an attachment sat.
  for (const line of text.replace(/\r\n?/g, "\n").replaceAll("\uFFFC", "").split("\n")) {
    const marker = /^(?:>(?=[ \t>]|$)[ \t]?)*/.exec(line)?.[0] ?? ""
    const depth = Math.min(marker.split(">").length - 1, MAX_QUOTE_DEPTH)
    const content = line.slice(marker.length).trimEnd()
    const previous = blocks.at(-1)
    if (previous?.depth === depth) previous.lines.push(content)
    else blocks.push({ depth, lines: [content] })
  }

  return blocks
    .map(({ depth, lines }) => ({
      depth,
      text: lines
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/^\n+|\n+$/g, ""),
    }))
    .filter(({ text }) => text !== "")
}
