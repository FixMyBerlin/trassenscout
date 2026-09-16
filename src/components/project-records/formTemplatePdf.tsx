import {
  Checkbox,
  Document,
  Page,
  pdf,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "@react-pdf/renderer"
import type { ResolvedFormTemplateField } from "@/src/shared/formTemplates/fieldSchemas"
import type {
  InlineRun,
  MarkdownBlock,
  MarkdownTableAlign,
} from "@/src/shared/formTemplates/markdownBlocks"
import {
  isCheckboxRun,
  isPlaceholderRun,
  parseMarkdownBlocks,
} from "@/src/shared/formTemplates/markdownBlocks"
import { FORM_PDF_FONT_SIZE as FONT_SIZE } from "@/src/shared/formTemplates/pdfLayout"

/**
 * Import only via `await import(...)`: the renderer is a large bundle. Not named `*.client.*`
 * because that pattern is blocked in the server graph, which would reject the dynamic import.
 */

const FIELD_HEIGHT = 12
/** Measured: baseline alignment drops the widget 8.55pt below the label. */
const FIELD_BASELINE_LIFT = 4
const MULTILINE_FIELD_HEIGHT = 56
const TABLE_BORDER = "0.7pt solid #9aa5b1"

const TABLE_KEEP_TOGETHER_MAX_ROWS = 12
const CHECKBOX_SIZE = 9
/** Measured like the text field's: baseline alignment drops the box below the line. */
const CHECKBOX_BASELINE_LIFT = 9

/** Keeps an unfilled blank writable on paper — a table cell is already one, so it gets none. */
const EMPTY_VALUE_MARKER = "__________"
const emptyValue = (inTableCell: boolean | undefined) => (inTableCell ? "" : EMPTY_VALUE_MARKER)

const styles = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 56, paddingHorizontal: 52, fontSize: FONT_SIZE },
  heading: { marginBottom: 4, marginTop: 10, fontFamily: "Helvetica-Bold" },
  
  paragraph: { marginBottom: 7 },
  listItem: { marginBottom: 1, flexDirection: "row" },
  listMarker: { width: 18 },
  listContent: { flex: 1 },
  // `lineHeight: 1`: inherited leading moves the text baseline down and drags the widget with it.
  fieldLine: { flexDirection: "row", alignItems: "baseline", lineHeight: 1, flexWrap: "wrap" },
  // A shrunken <Text> draws its glyphs outside its box, so the next widget covers them.
  fieldLineText: { flexShrink: 0 },
  field: {
    height: FIELD_HEIGHT,
    position: "relative",
    top: -FIELD_BASELINE_LIFT,
    flexShrink: 1,
    minWidth: 60,
    marginHorizontal: 2,
    backgroundColor: "#f2f6fb",
    borderBottom: "1pt solid #7b8794",
  },
  checkbox: { width: CHECKBOX_SIZE - 2, height: CHECKBOX_SIZE - 2 },
  checkboxBox: {
    width: CHECKBOX_SIZE,
    height: CHECKBOX_SIZE,
    marginRight: 3,
    border: "0.7pt solid #7b8794",
    alignItems: "center",
    justifyContent: "center",
  },
  table: {
    marginBottom: 5,
    borderTop: TABLE_BORDER,
    borderLeft: TABLE_BORDER,
  },
  tableRow: { flexDirection: "row" },
  tableHeaderRow: { backgroundColor: "#f4f5f7" },
  tableCell: {
    flex: 1,
    minHeight: FONT_SIZE + 5,
    paddingVertical: 2,
    paddingHorizontal: 3,
    borderRight: TABLE_BORDER,
    borderBottom: TABLE_BORDER,
  },
  checkboxLifted: { position: "relative", top: -CHECKBOX_BASELINE_LIFT },
  checkboxMark: { fontSize: CHECKBOX_SIZE - 2, lineHeight: 1, fontFamily: "Helvetica-Bold" },
  pageNumber: {
    position: "absolute",
    bottom: 28,
    left: 52,
    right: 52,
    textAlign: "center",
    fontSize: 9,
    color: "#666666",
  },
})

/**
 * Fixed per type: there is no measuring pass, so remaining line space cannot be computed.
 *
 * Width and multiline are all the field type controls. The renderer's `format` option is not
 * used: it emits its date mask unquoted (invalid JavaScript), and its number styles are all
 * dot-decimal, which would make Acrobat read a German "125.000" as 125.
 */
const fieldWidth = (type: ResolvedFormTemplateField["type"]) => {
  if (type === "textarea") return "100%"
  if (type === "number" || type === "date") return 90
  return 170
}

const headingSize = (level: number) => Math.max(11, 20 - level * 2)

const runFontFamily = (run: { bold?: boolean; italic?: boolean }) => {
  if (run.bold && run.italic) return "Helvetica-BoldOblique"
  if (run.bold) return "Helvetica-Bold"
  if (run.italic) return "Helvetica-Oblique"
  return "Helvetica"
}

type RenderContext = {
  /** `false` bakes values in as text — the print-and-sign version. */
  fillable: boolean
  fieldsByName: Map<string, ResolvedFormTemplateField>
  values: Record<string, string>
}

function PlaceholderField({
  name,
  context,
  fullWidth,
}: {
  name: string
  context: RenderContext
  /** In a table cell the column decides the width, not the field type. */
  fullWidth?: boolean
}) {
  const field = context.fieldsByName.get(name)
  const type = field?.type ?? "text"
  const value = context.values[name] ?? ""

  return (
    <TextInput
      name={name}
      // `value` writes /V; `defaultValue` would only set /DV, which viewers do not show.
      value={value}
      multiline={type === "textarea"}
      style={[
        styles.field,
        fullWidth
          ? { width: "100%", minWidth: 0, marginHorizontal: 0 }
          : {
              width: fieldWidth(type),
            },
        type === "textarea" ? { height: MULTILINE_FIELD_HEIGHT } : {},
      ]}
    />
  )
}

const isCheckedValue = (value: string | undefined) =>
  value !== undefined && value !== "" && value.toLowerCase() !== "off"


function CheckboxField({
  checkbox,
  context,
  lifted,
}: {
  checkbox: { name: string; checked: boolean }
  context: RenderContext
  lifted: boolean
}) {
  const stored = context.values[checkbox.name]
  const checked = stored === undefined ? checkbox.checked : isCheckedValue(stored)

  return (
    <View style={[styles.checkboxBox, lifted ? styles.checkboxLifted : {}]}>
      {context.fillable ? (
        <Checkbox name={checkbox.name} checked={checked} style={styles.checkbox} />
      ) : checked ? (
        <Text style={styles.checkboxMark}>X</Text>
      ) : null}
    </View>
  )
}

/** No widget on this line, so placeholders are baked in as their value. */
function TextLine({
  runs,
  context,
  inTableCell,
}: {
  runs: InlineRun[]
  context: RenderContext
  inTableCell?: boolean
}) {
  return (
    <Text>
      {runs.map((run, index) =>
        isCheckboxRun(run) ? null : isPlaceholderRun(run) ? (
          // eslint-disable-next-line react/no-array-index-key -- runs have no stable identity
          <Text key={index}>{context.values[run.placeholder] || emptyValue(inTableCell)}</Text>
        ) : (
          // eslint-disable-next-line react/no-array-index-key -- runs have no stable identity
          <Text key={index} style={{ fontFamily: runFontFamily(run) }}>
            {run.text}
          </Text>
        ),
      )}
    </Text>
  )
}

function LineRun({
  run,
  context,
  inTableCell,
  lifted,
}: {
  run: InlineRun
  context: RenderContext
  inTableCell?: boolean
  lifted: boolean
}) {
  if (isCheckboxRun(run)) {
    return <CheckboxField checkbox={run.checkbox} context={context} lifted={lifted} />
  }

  if (isPlaceholderRun(run)) {
    if (context.fillable) {
      return <PlaceholderField name={run.placeholder} context={context} fullWidth={inTableCell} />
    }

    return (
      <Text style={styles.fieldLineText}>
        {context.values[run.placeholder] || emptyValue(inTableCell)}
      </Text>
    )
  }

  return <Text style={[styles.fieldLineText, { fontFamily: runFontFamily(run) }]}>{run.text}</Text>
}

function Line({
  runs,
  context,
  inTableCell,
}: {
  runs: InlineRun[]
  context: RenderContext
  inTableCell?: boolean
}) {
  const hasField = runs.some(isCheckboxRun) || (context.fillable && runs.some(isPlaceholderRun))
  if (!hasField) return <TextLine runs={runs} context={context} inTableCell={inTableCell} />

  const hasText = runs.some(
    (run) => !isCheckboxRun(run) && !isPlaceholderRun(run) && run.text.trim(),
  )

  return (
    <View style={styles.fieldLine}>
      {runs.map((run, index) => (
        <LineRun
          // eslint-disable-next-line react/no-array-index-key -- runs have no stable identity
          key={index}
          run={run}
          context={context}
          inTableCell={inTableCell}
          lifted={Boolean(hasText)}
        />
      ))}
    </View>
  )
}

function Lines({ lines, context }: { lines: InlineRun[][]; context: RenderContext }) {
  return (
    <>
      {lines.map((runs, index) => (
        // eslint-disable-next-line react/no-array-index-key -- lines have no stable identity
        <Line key={index} runs={runs} context={context} />
      ))}
    </>
  )
}

const cellAlignStyle = (align: MarkdownTableAlign | undefined) => {
  if (align === "right") return { textAlign: "right" as const, alignItems: "flex-end" as const }
  if (align === "center") return { textAlign: "center" as const, alignItems: "center" as const }
  return {}
}

function Table({ block, context }: { block: MarkdownBlock; context: RenderContext }) {
  const rows = block.rows ?? []
  const columnCount = block.align?.length ?? rows[0]?.cells.length ?? 0
  if (!columnCount) return null

  const keepTogether = rows.length <= TABLE_KEEP_TOGETHER_MAX_ROWS

  return (
    <View style={styles.table} wrap={!keepTogether}>
      {rows.map((row, rowIndex) => (
        <View
          // eslint-disable-next-line react/no-array-index-key -- rows have no stable identity
          key={rowIndex}
          style={[styles.tableRow, row.header ? styles.tableHeaderRow : {}]}
          wrap={false}
          fixed={!keepTogether && row.header}
        >
          {Array.from({ length: columnCount }, (_, cellIndex) => (
            <View
              // eslint-disable-next-line react/no-array-index-key -- cells have no stable identity
              key={cellIndex}
              style={[styles.tableCell, cellAlignStyle(block.align?.[cellIndex])]}
            >
              <Line runs={row.cells[cellIndex] ?? []} context={context} inTableCell />
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

function Block({ block, context }: { block: MarkdownBlock; context: RenderContext }) {
  if (block.type === "table") return <Table block={block} context={context} />

  if (block.type === "heading") {
    return (
      <View style={[styles.heading, { fontSize: headingSize(block.level ?? 1) }]} wrap={false}>
        <Lines lines={block.lines} context={context} />
      </View>
    )
  }

  if (block.type === "listItem") {
    return (
      <View style={styles.listItem}>
        <Text style={styles.listMarker}>{block.marker}</Text>
        <View style={styles.listContent}>
          <Lines lines={block.lines} context={context} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.paragraph}>
      <Lines lines={block.lines} context={context} />
    </View>
  )
}

export type RenderFormTemplatePdfInput = {
  /** Raw template markdown, placeholders intact. */
  markdown: string
  title: string
  fields: ResolvedFormTemplateField[]
  values: Record<string, string>
  /** `true` keeps the fields editable; `false` bakes values in. */
  fillable: boolean
}

/**
 * The renderer only ever writes `/DA (/F1 0 Tf 0 g)` — `0` means auto-size, so every viewer
 * picks its own size. Neither the `fontSize` prop nor style changes it, hence patching after.
 */
async function setFormFieldFontSize(bytes: Uint8Array, fontSize: number) {
  const { PDFDocument, PDFName, PDFString } = await import("@cantoo/pdf-lib")
  const document = await PDFDocument.load(bytes)
  const form = document.getForm()

  // The `/DA` sits on the AcroForm dict, not the fields, so `setFontSize` finds nothing.
  const currentDefaultAppearance = form.acroForm.dict.get(PDFName.of("DA"))?.toString() ?? ""
  const fontName = /\/(\w+)\s+[\d.]+\s+Tf/.exec(currentDefaultAppearance)?.[1] ?? "F1"
  const defaultAppearance = `/${fontName} ${fontSize} Tf 0 g`

  form.acroForm.dict.set(PDFName.of("DA"), PDFString.of(defaultAppearance))
  // Some viewers read only the field's own entry.
  for (const field of form.getFields()) {
    field.acroField.setDefaultAppearance(defaultAppearance)
  }

  // Regenerating appearances would reference a Helvetica absent from this document.
  return document.save({ updateFieldAppearances: false })
}

export async function renderFormTemplatePdf(input: RenderFormTemplatePdfInput) {
  const blocks = parseMarkdownBlocks(input.markdown)
  const context: RenderContext = {
    fillable: input.fillable,
    fieldsByName: new Map(input.fields.map((field) => [field.name, field])),
    values: input.values,
  }

  const document = (
    <Document title={input.title}>
      <Page size="A4" style={styles.page}>
        {blocks.map((block, index) => (
          // eslint-disable-next-line react/no-array-index-key -- blocks have no stable identity
          <Block key={index} block={block} context={context} />
        ))}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  )

  const blob = await pdf(document).toBlob()
  if (!input.fillable) return blob

  const sized = await setFormFieldFontSize(new Uint8Array(await blob.arrayBuffer()), FONT_SIZE)
  return new Blob([sized as unknown as BlobPart], { type: "application/pdf" })
}
