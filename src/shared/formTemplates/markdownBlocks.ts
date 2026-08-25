/**
 * A deliberately small markdown reader for PDF output.
 *
 * The PDF renderer needs positioned blocks and styled text runs, which the HTML preview
 * (react-remark) cannot hand over. Rather than pull in a second full markdown pipeline,
 * this covers the subset that form documents converted from Word actually use: headings,
 * paragraphs, list items, bold and italic. Anything else is carried through as plain text,
 * so an unsupported construct degrades to readable output instead of disappearing.
 */

type InlineTextRun = {
  text: string
  bold?: boolean
  italic?: boolean
}

export type InlinePlaceholderRun = {
  placeholder: string
}

export type InlineRun = InlineTextRun | InlinePlaceholderRun

export const isPlaceholderRun = (run: InlineRun): run is InlinePlaceholderRun =>
  "placeholder" in run

export type MarkdownBlock = {
  type: "heading" | "paragraph" | "listItem"
  level?: number
  marker?: string
  /** One per source line, so manual line breaks survive. */
  lines: InlineRun[][]
}

const HEADING = /^(#{1,6})\s+(.*)$/
const UNORDERED_ITEM = /^\s*[-*+]\s+(.*)$/
const ORDERED_ITEM = /^\s*(\d+)[.)]\s+(.*)$/

/** Undoes the `\_` escapes Word exports produce. */
const unescape = (value: string) => value.replace(/\\([\\`*_{}[\]()#+\-.!])/g, "$1")

/** Anchored: matched from the current index. */
const PLACEHOLDER_AT_INDEX = /^{{\s*([a-zA-Z0-9_]+)\s*}}/

/** An unmatched marker stays literal instead of swallowing the rest of the line. */
export function parseInlineRuns(line: string): InlineRun[] {
  const runs: InlineRun[] = []
  let buffer = ""
  let index = 0

  const flush = () => {
    if (!buffer) return
    runs.push({ text: unescape(buffer) })
    buffer = ""
  }

  while (index < line.length) {
    const isEscaped = line[index] === "\\"
    if (isEscaped) {
      buffer += line.slice(index, index + 2)
      index += 2
      continue
    }

    if (line.startsWith("{{", index)) {
      const placeholder = PLACEHOLDER_AT_INDEX.exec(line.slice(index))
      if (placeholder) {
        flush()
        runs.push({ placeholder: placeholder[1]! })
        index += placeholder[0].length
        continue
      }
    }

    const isBoldMarker = line.startsWith("**", index)
    const isItalicMarker = !isBoldMarker && line[index] === "*"

    if (isBoldMarker || isItalicMarker) {
      const marker = isBoldMarker ? "**" : "*"
      const closing = line.indexOf(marker, index + marker.length)
      const content = closing === -1 ? "" : line.slice(index + marker.length, closing)

      if (closing !== -1 && content.length > 0) {
        flush()
        // Recursive so a placeholder inside `**…**` still becomes a field.
        const style = isBoldMarker ? { bold: true } : { italic: true }
        for (const run of parseInlineRuns(content)) {
          runs.push(isPlaceholderRun(run) ? run : { ...run, ...style })
        }
        index = closing + marker.length
        continue
      }
    }

    buffer += line[index]
    index += 1
  }

  flush()
  return runs
}

export function parseMarkdownBlocks(markdown: string | null | undefined): MarkdownBlock[] {
  if (!markdown) return []

  const blocks: MarkdownBlock[] = []
  // Tabs are column separators in Word exports.
  const lines = markdown.replace(/\r\n?/g, "\n").replace(/\t/g, "    ").split("\n")

  let paragraphLines: InlineRun[][] = []

  const flushParagraph = () => {
    if (!paragraphLines.length) return
    blocks.push({ type: "paragraph", lines: paragraphLines })
    paragraphLines = []
  }

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "")

    if (!line.trim()) {
      flushParagraph()
      continue
    }

    const heading = HEADING.exec(line)
    if (heading) {
      flushParagraph()
      blocks.push({
        type: "heading",
        level: heading[1]!.length,
        lines: [parseInlineRuns(heading[2]!)],
      })
      continue
    }

    const ordered = ORDERED_ITEM.exec(line)
    if (ordered) {
      flushParagraph()
      blocks.push({
        type: "listItem",
        marker: `${ordered[1]}.`,
        lines: [parseInlineRuns(ordered[2]!)],
      })
      continue
    }

    const unordered = UNORDERED_ITEM.exec(line)
    if (unordered) {
      flushParagraph()
      blocks.push({ type: "listItem", marker: "•", lines: [parseInlineRuns(unordered[1]!)] })
      continue
    }

    paragraphLines.push(parseInlineRuns(line))
  }

  flushParagraph()
  return blocks
}
