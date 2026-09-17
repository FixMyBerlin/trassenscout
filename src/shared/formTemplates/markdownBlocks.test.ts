import { describe, expect, it } from "vitest"
import { formTemplateFieldTypes } from "./fieldSchemas"
import { isCheckboxRun, parseInlineRuns, parseMarkdownBlocks } from "./markdownBlocks"

describe("parseInlineRuns", () => {
  it("returns one plain run for plain text", () => {
    expect(parseInlineRuns("Guten Tag")).toEqual([{ text: "Guten Tag" }])
  })

  it("marks bold and italic segments", () => {
    expect(parseInlineRuns("**Antrag** auf *Zuschuss*")).toEqual([
      { text: "Antrag", bold: true },
      { text: " auf " },
      { text: "Zuschuss", italic: true },
    ])
  })

  it("prefers bold over italic for a double marker", () => {
    expect(parseInlineRuns("**fett**")).toEqual([{ text: "fett", bold: true }])
  })

  it("treats an unmatched marker as literal text", () => {
    expect(parseInlineRuns("3 * 4 = 12")).toEqual([{ text: "3 * 4 = 12" }])
  })

  it("unescapes the backslash escapes that Word exports produce", () => {
    expect(parseInlineRuns("\\_\\_\\_ Unterschrift")).toEqual([{ text: "___ Unterschrift" }])
  })

  it("does not treat an escaped asterisk as a marker", () => {
    expect(parseInlineRuns("\\*kein Kursiv\\*")).toEqual([{ text: "*kein Kursiv*" }])
  })

  it("reads a placeholder with umlauts as a field", () => {
    expect(parseInlineRuns("Empfänger: {{Zuwendungsempfänger}}")).toEqual([
      { text: "Empfänger: " },
      { placeholder: "Zuwendungsempfänger" },
    ])
  })

  it("returns nothing for an empty line", () => {
    expect(parseInlineRuns("")).toEqual([])
  })

  it("reads `[]` as an unticked checkbox and `[x]` as a ticked one", () => {
    expect(parseInlineRuns("[] Lageplan [x] Kostenschätzung")).toEqual([
      { checkbox: { name: "checkbox_1", checked: false } },
      { text: " Lageplan " },
      { checkbox: { name: "checkbox_2", checked: true } },
      { text: " Kostenschätzung" },
    ])
  })

  it("accepts a space inside the box", () => {
    expect(parseInlineRuns("[ ] Lageplan")).toEqual([
      { checkbox: { name: "checkbox_1", checked: false } },
      { text: " Lageplan" },
    ])
  })

  it("leaves a link alone", () => {
    expect(parseInlineRuns("[Impressum](https://example.org)")).toEqual([
      { text: "[Impressum](https://example.org)" },
    ])
  })

  it("keeps a checkbox unstyled inside bold text", () => {
    expect(parseInlineRuns("**[] Pflichtfeld**")).toEqual([
      { checkbox: { name: "checkbox_1", checked: false } },
      { text: " Pflichtfeld", bold: true },
    ])
  })
})

describe("parseMarkdownBlocks", () => {
  it("returns nothing for empty input", () => {
    expect(parseMarkdownBlocks("")).toEqual([])
    expect(parseMarkdownBlocks(null)).toEqual([])
  })

  it("splits paragraphs on blank lines and keeps line breaks inside one", () => {
    const blocks = parseMarkdownBlocks("Zeile eins\nZeile zwei\n\nNeuer Absatz")
    expect(blocks).toHaveLength(2)
    expect(blocks[0]!.type).toBe("paragraph")
    expect(blocks[0]!.lines).toHaveLength(2)
    expect(blocks[1]!.lines).toHaveLength(1)
  })

  it("reads headings with their level", () => {
    const blocks = parseMarkdownBlocks("# Antrag\n\n### Anlagen")
    expect(blocks.map((block) => [block.type, block.level])).toEqual([
      ["heading", 1],
      ["heading", 3],
    ])
  })

  it("reads ordered and unordered list items with a marker", () => {
    const blocks = parseMarkdownBlocks("- erstens\n\n2. zweitens")
    expect(blocks.map((block) => [block.type, block.marker])).toEqual([
      ["listItem", "•"],
      ["listItem", "2."],
    ])
  })

  it("keeps styling inside blocks", () => {
    const blocks = parseMarkdownBlocks("**Antrag**")
    expect(blocks[0]!.lines[0]).toEqual([{ text: "Antrag", bold: true }])
  })

  it("turns tabs into spaces so columns do not run together", () => {
    const blocks = parseMarkdownBlocks("Antragsteller\tOrt")
    expect(blocks[0]!.lines[0]).toEqual([{ text: "Antragsteller    Ort" }])
  })

  it("handles a document that is only blank lines", () => {
    expect(parseMarkdownBlocks("\n\n   \n")).toEqual([])
  })
})

describe("placeholder runs", () => {
  it("keeps a placeholder as its own run", () => {
    expect(parseInlineRuns("Ort: {{ort}}")).toEqual([{ text: "Ort: " }, { placeholder: "ort" }])
  })

  it("tolerates whitespace inside the braces", () => {
    expect(parseInlineRuns("{{ ort }}")).toEqual([{ placeholder: "ort" }])
  })

  it("reads several placeholders on one line with text between them", () => {
    expect(parseInlineRuns("{{a}} und {{b}}")).toEqual([
      { placeholder: "a" },
      { text: " und " },
      { placeholder: "b" },
    ])
  })

  it("leaves a malformed placeholder as literal text", () => {
    expect(parseInlineRuns("{{mit-strich}}")).toEqual([{ text: "{{mit-strich}}" }])
  })

  it("still yields a placeholder run inside a styled span", () => {
    expect(parseInlineRuns("**{{ort}}**")).toEqual([{ placeholder: "ort" }])
  })

  it("styles the text around a placeholder inside a styled span", () => {
    expect(parseInlineRuns("**Ort: {{ort}}**")).toEqual([
      { text: "Ort: ", bold: true },
      { placeholder: "ort" },
    ])
  })

  it("survives a lone opening brace pair", () => {
    expect(parseInlineRuns("{{ nope")).toEqual([{ text: "{{ nope" }])
  })
})

describe("field types affect layout only", () => {
  it("keeps the type list to what the renderer can actually honour", () => {
    // Width and multiline are all a type controls; see `fieldWidth` in formTemplatePdf.tsx.
    expect([...formTemplateFieldTypes]).toEqual(["text", "textarea", "number", "date"])
  })
})

describe("checkbox names", () => {
  it("counts up across blocks so every box is its own field", () => {
    const blocks = parseMarkdownBlocks(`# [] Titelbox

- [] Lageplan
- [x] Kostenschätzung

Absatz mit [] am Ende`)

    const names = blocks
      .flatMap((block) => block.lines.flat())
      .filter(isCheckboxRun)
      .map((run) => run.checkbox.name)

    expect(names).toEqual(["checkbox_1", "checkbox_2", "checkbox_3", "checkbox_4"])
  })
})

describe("tables", () => {
  const table = `| Kostenart | Betrag |
| --- | ---: |
| Planung | {{planung}} |
| Bau | 120.000 € |`

  it("reads a pipe table with its header, rows and alignment", () => {
    const [block, ...rest] = parseMarkdownBlocks(table)

    expect(rest).toEqual([])
    expect(block?.type).toBe("table")
    expect(block?.align).toEqual(["left", "right"])
    expect(block?.rows?.map((row) => Boolean(row.header))).toEqual([true, false, false])
  })

  it("makes the header bold and keeps placeholders in cells", () => {
    const [block] = parseMarkdownBlocks(table)

    expect(block?.rows?.[0]?.cells).toEqual([
      [{ text: "Kostenart", bold: true }],
      [{ text: "Betrag", bold: true }],
    ])
    expect(block?.rows?.[1]?.cells[1]).toEqual([{ placeholder: "planung" }])
  })

  it("pads a short row so the grid stays rectangular", () => {
    const [block] = parseMarkdownBlocks(`| A | B | C |
| --- | --- | --- |
| nur eins |`)

    expect(block?.rows?.[1]?.cells).toEqual([[{ text: "nur eins" }], [], []])
  })

  it("ends the table at the first line without a pipe", () => {
    const blocks = parseMarkdownBlocks(`${table}

Ein Absatz danach.`)

    expect(blocks.map((block) => block.type)).toEqual(["table", "paragraph"])
  })

  it("leaves a lone pipe line as a paragraph, without a delimiter row", () => {
    expect(parseMarkdownBlocks("Betrag | Summe").map((block) => block.type)).toEqual(["paragraph"])
  })

  it("keeps an escaped pipe inside its cell", () => {
    const [block] = parseMarkdownBlocks(`| A | B |
| --- | --- |
| eins \\| zwei | drei |`)

    expect(block?.rows?.[1]?.cells).toEqual([[{ text: "eins | zwei" }], [{ text: "drei" }]])
  })
})
