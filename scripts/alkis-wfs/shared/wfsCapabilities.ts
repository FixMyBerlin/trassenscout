import { DEFAULT_TIMEOUT_MS } from "./constants"

export type ParsedCapabilitiesFeatureType = {
  name: string
  defaultCrs: string
  otherCrs: string[]
}

export function sanitizeReportText(s: string, maxLen = 400): string {
  const noNull = s.replace(/\0/g, "")
  if (/JFIF|^\s*\xff\xd8\xff/i.test(noNull)) {
    return "non-text body (binary image or similar)"
  }
  const printable = noNull.replace(/[^\x09\x0a\x0d\x20-\x7E\u00A0-\uFFFF]/g, " ")
  const oneLine = printable.replace(/\s+/g, " ").trim()
  return oneLine.length <= maxLen ? oneLine : `${oneLine.slice(0, maxLen)}...`
}

export function wfsGetCapabilitiesUrl(baseUrl: string): string {
  const u = new URL(baseUrl)
  u.searchParams.set("SERVICE", "WFS")
  u.searchParams.set("VERSION", "2.0.0")
  u.searchParams.set("REQUEST", "GetCapabilities")
  return u.toString()
}

export function parseCapabilitiesXml(xml: string): {
  outputFormats: string[]
  featureTypes: ParsedCapabilitiesFeatureType[]
  error?: string
} {
  const trimmed = xml.trim()
  if (!trimmed.startsWith("<")) {
    return { outputFormats: [], featureTypes: [], error: "Response is not XML." }
  }

  const outputFormats: string[] = []
  const opRe =
    /<(?:[\w.]+:)?Operation\b[^>]*\bname=["']GetFeature["'][^>]*>([\s\S]*?)<\/(?:[\w.]+:)?Operation>/i
  const opM = trimmed.match(opRe)
  const opInner = opM?.[1]
  if (opInner) {
    const paramRe =
      /<(?:[\w.]+:)?Parameter\b[^>]*\bname=["']outputFormat["'][^>]*>([\s\S]*?)<\/(?:[\w.]+:)?Parameter>/i
    const pm = opInner.match(paramRe)
    const paramBlock = pm?.[1] ?? opInner
    const valueRe = /<(?:[\w.]+:)?Value\b[^>]*>([^<]*)<\/(?:[\w.]+:)?Value>/gi
    let vm: RegExpExecArray | null
    while ((vm = valueRe.exec(paramBlock)) !== null) {
      const t = vm[1]?.trim()
      if (t) outputFormats.push(t)
    }
  }

  const featureTypes: ParsedCapabilitiesFeatureType[] = []
  const ftRe = /<(?:[\w.]+:)?FeatureType\b[^>]*>([\s\S]*?)<\/(?:[\w.]+:)?FeatureType>/gi
  let ftm: RegExpExecArray | null
  while ((ftm = ftRe.exec(trimmed)) !== null) {
    const block = ftm[1] ?? ""
    const nameM = block.match(/<(?:[\w.]+:)?Name\b[^>]*>([^<]*)<\/(?:[\w.]+:)?Name>/i)
    const name = nameM?.[1]?.trim() ?? ""
    if (!name) continue
    const defM = block.match(/<(?:[\w.]+:)?DefaultCRS\b[^>]*>([^<]*)<\/(?:[\w.]+:)?DefaultCRS>/i)
    const defaultCrs = defM?.[1]?.trim() ?? ""
    const otherCrs: string[] = []
    const ocr = /<(?:[\w.]+:)?OtherCRS\b[^>]*>([^<]*)<\/(?:[\w.]+:)?OtherCRS>/gi
    let om: RegExpExecArray | null
    while ((om = ocr.exec(block)) !== null) {
      const t = om[1]?.trim()
      if (t) otherCrs.push(t)
    }
    featureTypes.push({ name, defaultCrs, otherCrs })
  }

  if (!outputFormats.length && !featureTypes.length) {
    return {
      outputFormats: [],
      featureTypes: [],
      error: "Could not parse expected capabilities blocks.",
    }
  }
  return { outputFormats, featureTypes }
}

export async function fetchWfsCapabilities(
  baseUrl: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<{
  ok: boolean
  httpStatus: number
  requestUrl: string
  xml: string
  error?: string
}> {
  const requestUrl = wfsGetCapabilitiesUrl(baseUrl)
  try {
    const res = await fetch(requestUrl, {
      method: "GET",
      headers: { Accept: "application/xml, text/xml, */*" },
      signal: AbortSignal.timeout(timeoutMs),
    })
    const xml = await res.text()
    if (!res.ok) {
      return {
        ok: false,
        httpStatus: res.status,
        requestUrl,
        xml: "",
        error: `HTTP ${res.status}: ${sanitizeReportText(xml, 220)}`,
      }
    }
    return { ok: true, httpStatus: res.status, requestUrl, xml }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return { ok: false, httpStatus: 0, requestUrl, xml: "", error: msg }
  }
}
