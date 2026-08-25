import { Document, Page, pdf, StyleSheet, Text, TextInput, View } from "@react-pdf/renderer"
import type { ResolvedFormTemplateField } from "@/src/shared/formTemplates/fieldSchemas"
import type { InlineRun, MarkdownBlock } from "@/src/shared/formTemplates/markdownBlocks"
import { isPlaceholderRun, parseMarkdownBlocks } from "@/src/shared/formTemplates/markdownBlocks"
import { FORM_PDF_FONT_SIZE as FONT_SIZE } from "@/src/shared/formTemplates/pdfLayout"

/**
 * Import only via `await import(...)`: the renderer is a large bundle. Not named `*.client.*`
 * because that pattern is blocked in the server graph, which would reject the dynamic import.
 */

const FIELD_HEIGHT = 14
/** Measured: baseline alignment drops the widget 8.55pt below the label. */
const FIELD_BASELINE_LIFT = 4
const MULTILINE_FIELD_HEIGHT = 56

/** Keeps an unfilled blank writable on paper. */
const EMPTY_VALUE_MARKER = "__________"

const styles = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 56, paddingHorizontal: 52, fontSize: FONT_SIZE },
  heading: { marginBottom: 8, marginTop: 12, fontFamily: "Helvetica-Bold" },
  paragraph: { marginBottom: 8, lineHeight: 1.4 },
  listItem: { marginBottom: 4, flexDirection: "row", lineHeight: 1.4 },
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

function PlaceholderField({ name, context }: { name: string; context: RenderContext }) {
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
        {
          width: fieldWidth(type),
          ...(type === "textarea" ? { height: MULTILINE_FIELD_HEIGHT } : {}),
        },
      ]}
    />
  )
}

/** No widget on this line, so placeholders are baked in as their value. */
function TextLine({ runs, context }: { runs: InlineRun[]; context: RenderContext }) {
  return (
    <Text>
      {runs.map((run, index) =>
        isPlaceholderRun(run) ? (
          // eslint-disable-next-line react/no-array-index-key -- runs have no stable identity
          <Text key={index}>{context.values[run.placeholder] || EMPTY_VALUE_MARKER}</Text>
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

function Line({ runs, context }: { runs: InlineRun[]; context: RenderContext }) {
  const hasField = context.fillable && runs.some(isPlaceholderRun)
  if (!hasField) return <TextLine runs={runs} context={context} />

  return (
    <View style={styles.fieldLine}>
      {runs.map((run, index) =>
        isPlaceholderRun(run) ? (
          // eslint-disable-next-line react/no-array-index-key -- runs have no stable identity
          <PlaceholderField key={index} name={run.placeholder} context={context} />
        ) : (
          <Text
            // eslint-disable-next-line react/no-array-index-key -- runs have no stable identity
            key={index}
            style={[styles.fieldLineText, { fontFamily: runFontFamily(run) }]}
          >
            {run.text}
          </Text>
        ),
      )}
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

function Block({ block, context }: { block: MarkdownBlock; context: RenderContext }) {
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
          render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
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
