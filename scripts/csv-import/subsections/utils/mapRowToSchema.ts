import {
  LineStringGeometrySchema,
  MultiLineStringGeometrySchema,
  MultiPolygonGeometrySchema,
  PointGeometrySchema,
  PolygonGeometrySchema,
} from "@/src/core/utils/geojson-schemas"
import { FeatureSchema, SubsectionBaseSchema } from "@/src/server/subsections/schema"
import type { CsvRow } from "../../utils/parseCsv"

/**
 * Normalizes numeric string by handling comma/decimal separators
 */
function normalizeNumericString(value: string): string {
  const trimmed = value.trim()
  const hasComma = trimmed.includes(",")
  const hasDot = trimmed.includes(".")

  if (hasComma && hasDot) {
    return trimmed.replace(/,/g, "")
  } else if (hasComma && !hasDot) {
    return trimmed.replace(/,/g, ".")
  }

  return trimmed
}

/**
 * Maps CSV row data to subsection import schema format
 */
export function mapRowToSchema(row: CsvRow) {
  const mappedData: Record<string, any> = {}
  const schemaShape = SubsectionBaseSchema.shape
  const unmatchedColumns: string[] = []

  const rowEntries = Object.entries(row || {})
  for (const [csvKey, csvValue] of rowEntries) {
    switch (csvKey) {
      case "project":
        continue
      case "slug":
        mappedData.slug = String(csvValue).trim().toLowerCase()
        continue
      case "description": {
        const s = String(csvValue ?? "").trim()
        mappedData.description = s === "" ? null : s
        continue
      }
      case "geometry": {
        const geometryStr = String(csvValue || "").trim()
        if (geometryStr === "") {
          continue
        }

        let parsed: unknown
        try {
          parsed = JSON.parse(geometryStr)
        } catch {
          parsed = csvValue
        }

        const featureResult = FeatureSchema.safeParse(parsed)
        let geometry: unknown

        if (featureResult.success) {
          geometry = featureResult.data.geometry
        } else {
          geometry = parsed
        }

        mappedData.geometry = geometry

        const pointResult = PointGeometrySchema.safeParse(geometry)
        const lineStringResult = LineStringGeometrySchema.or(
          MultiLineStringGeometrySchema,
        ).safeParse(geometry)
        const polygonResult = PolygonGeometrySchema.or(MultiPolygonGeometrySchema).safeParse(
          geometry,
        )

        if (pointResult.success) {
          mappedData.type = "POINT"
        } else if (lineStringResult.success) {
          mappedData.type = "LINE"
        } else if (polygonResult.success) {
          mappedData.type = "POLYGON"
        }
        continue
      }
      case "type":
        unmatchedColumns.push(csvKey)
        continue
      case "labelPos":
        mappedData[csvKey] = String(csvValue).toLowerCase().trim()
        continue
      case "lengthM": {
        const normalized = normalizeNumericString(String(csvValue))
        const parsed = Number(normalized)
        mappedData[csvKey] = isNaN(parsed) ? csvValue : parsed
        continue
      }
      case "managerId":
      case "operatorId":
      case "networkHierarchyId":
      case "subsectionStatusId": {
        const str = String(csvValue).trim()
        const parsed = Number(str)
        mappedData[csvKey] = isNaN(parsed) ? null : parsed
        continue
      }
      default: {
        const fieldName = csvKey in schemaShape ? csvKey : undefined
        if (!fieldName) {
          unmatchedColumns.push(csvKey)
          continue
        }
        mappedData[fieldName] = csvValue
        continue
      }
    }
  }

  if (!mappedData.labelPos) {
    mappedData.labelPos = "top"
  }

  return { mappedData, unmatchedColumns }
}
