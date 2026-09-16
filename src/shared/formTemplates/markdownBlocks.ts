/**
 * A deliberately small markdown reader for PDF output.
 *
 * The PDF renderer needs positioned blocks and styled text runs, which the HTML preview
 * (react-remark) cannot hand over. Rather than pull in a second full markdown pipeline,
 * this covers the subset that form documents converted from Word actually use: headings,
 * paragraphs, list items, tables, bold, italic and checkboxes. Anything else is carried through
 * as plain text, so an unsupported construct degrades to readable output instead of disappearing.
 */

type InlineTextRun = {
  text: string
  bold?: boolean
  italic?: boolean
}

export type InlinePlaceholderRun = {
  placeholder: string
}

export type InlineCheckboxRun = {
  checkbox: { name: string; checked: boolean }
}

export type InlineRun = InlineTextRun | InlinePlaceholderRun | InlineCheckboxRun

export const isPlaceholderRun = (run: InlineRun): run is InlinePlaceholderRun =>
  "placeholder" in run

export const isCheckboxRun = (run: InlineRun): run is InlineCheckboxRun => "checkbox" in run

type CheckboxNamer = () => string

const createCheckboxNamer = (): CheckboxNamer => {
  let count = 0
  return () => `checkbox_${++count}`
}

export type MarkdownTableAlign = "left" | "center" | "right"

type MarkdownTableRow = {
  cells: InlineRun[][]
  header: boolean
}

export type MarkdownBlock = {
  type: "heading" | "paragraph" | "listItem" | "table"
  level?: number
  marker?: string
  lines: InlineRun[][]
  rows?: MarkdownTableRow[]
  align?: MarkdownTableAlign[]
}

const HEADING = /^(#{1,6})\s+(.*)$/
const UNORDERED_ITEM = /^\s*[-*+]\s+(.*)$/
const ORDERED_ITEM = /^\s*(\d+)[.)]\s+(.*)$/

const unescape = (value: string) => value.replace(/\\([\\`*_{}[\]()#+\-.!|])/g, "$1")

const PLACEHOLDER_AT_INDEX = /^\{\{\s*([\p{L}\p{N}_]+)\s*\}\}/u

const CHECKBOX_AT_INDEX = /^\[([ xX]?)\]/

/** An unmatched marker stays literal instead of swallowing the rest of the line. */
export function parseInlineRuns(line: string, nextCheckboxName?: CheckboxNamer): InlineRun[] {
  const namer = nextCheckboxName ?? createCheckboxNamer()
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

    if (line[index] === "[") {
      const checkbox = CHECKBOX_AT_INDEX.exec(line.slice(index))
      if (checkbox) {
        flush()
        const checked = checkbox[1]!.toLowerCase() === "x"
        runs.push({ checkbox: { name: namer(), checked } })
        index += checkbox[0].length
        continue
      }
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
        for (const run of parseInlineRuns(content, namer)) {
          runs.push(isPlaceholderRun(run) || isCheckboxRun(run) ? run : { ...run, ...style })
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

const splitTableCells = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim())

const isTableLine = (line: string) => line.includes("|")

/** The `| --- | ---: |` row: it both confirms the table and carries the column alignment. */
function parseTableAlignments(line: string | undefined): MarkdownTableAlign[] | null {
  if (line === undefined || !isTableLine(line)) return null

  const cells = splitTableCells(line)
  if (!cells.length || !cells.every((cell) => /^:?-+:?$/.test(cell))) return null

  return cells.map((cell) => {
    if (cell.startsWith(":") && cell.endsWith(":")) return "center"
    if (cell.endsWith(":")) return "right"
    return "left"
  })
}

function parseTableRow(
  source: string,
  alignments: MarkdownTableAlign[],
  header: boolean,
  nextCheckboxName: CheckboxNamer,
): MarkdownTableRow {
  const cells = splitTableCells(source).map((cell) => {
    const runs = parseInlineRuns(cell, nextCheckboxName)
    if (!header) return runs

    return runs.map((run) =>
      isPlaceholderRun(run) || isCheckboxRun(run) ? run : { ...run, bold: true },
    )
  })

  while (cells.length < alignments.length) cells.push([])

  return { cells: cells.slice(0, alignments.length), header }
}

function readTable(
  lines: string[],
  headerIndex: number,
  alignments: MarkdownTableAlign[],
  nextCheckboxName: CheckboxNamer,
) {
  const rows = [parseTableRow(lines[headerIndex]!, alignments, true, nextCheckboxName)]
  let index = headerIndex + 1

  while (isTableLine(lines[index + 1]?.trim() ?? "")) {
    index += 1
    rows.push(parseTableRow(lines[index]!, alignments, false, nextCheckboxName))
  }

  const block: MarkdownBlock = { type: "table", lines: [], rows, align: alignments }
  return { block, index }
}

export function parseMarkdownBlocks(markdown: string | null | undefined): MarkdownBlock[] {
  if (!markdown) return []

  const blocks: MarkdownBlock[] = []
  const nextCheckboxName = createCheckboxNamer()
  // Tabs are column separators in Word exports.
  const lines = markdown.replace(/\r\n?/g, "\n").replace(/\t/g, "    ").split("\n")

  let paragraphLines: InlineRun[][] = []

  const flushParagraph = () => {
    if (!paragraphLines.length) return
    blocks.push({ type: "paragraph", lines: paragraphLines })
    paragraphLines = []
  }

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]!.replace(/\s+$/, "")

    if (!line.trim()) {
      flushParagraph()
      continue
    }

    const alignments = isTableLine(line) ? parseTableAlignments(lines[index + 1]) : null
    if (alignments) {
      flushParagraph()
      const table = readTable(lines, index, alignments, nextCheckboxName)
      blocks.push(table.block)
      index = table.index
      continue
    }

    const heading = HEADING.exec(line)
    if (heading) {
      flushParagraph()
      blocks.push({
        type: "heading",
        level: heading[1]!.length,
        lines: [parseInlineRuns(heading[2]!, nextCheckboxName)],
      })
      continue
    }

    const ordered = ORDERED_ITEM.exec(line)
    if (ordered) {
      flushParagraph()
      blocks.push({
        type: "listItem",
        marker: `${ordered[1]}.`,
        lines: [parseInlineRuns(ordered[2]!, nextCheckboxName)],
      })
      continue
    }

    const unordered = UNORDERED_ITEM.exec(line)
    if (unordered) {
      flushParagraph()
      blocks.push({
        type: "listItem",
        marker: "•",
        lines: [parseInlineRuns(unordered[1]!, nextCheckboxName)],
      })
      continue
    }

    paragraphLines.push(parseInlineRuns(line, nextCheckboxName))
  }

  flushParagraph()
  return blocks
}
