import { centroid, polygon } from "@turf/turf"
import { midPoint } from "@/src/components/core/components/Map/utils/midPoint"
import { addressNoreply } from "./utils/addresses"
import { sendMail } from "./utils/sendMail"
import { Mail } from "./utils/types"

function detectGeometryType(
  value: string,
): "point" | "lineString" | "multiLineString" | "polygon" | "unknown" {
  try {
    const geometry = JSON.parse(value) as unknown
    if (!Array.isArray(geometry)) return "unknown"
    if (typeof geometry[0] === "number" && typeof geometry[1] === "number") return "point"
    if (Array.isArray(geometry[0]) && typeof geometry[0][0] === "number") return "lineString"
    if (Array.isArray(geometry[0]) && Array.isArray(geometry[0][0])) {
      return Array.isArray(geometry[0][0][0]) ? "polygon" : "multiLineString"
    }
    return "unknown"
  } catch {
    return "unknown"
  }
}

function generateOsmLink(fieldName: string, value: string): string {
  try {
    // Handle geometryCategory fields
    if (fieldName === "geometryCategory") {
      const geometryType = detectGeometryType(value)
      let osmCoords: [number, number] | null = null

      switch (geometryType) {
        case "point":
          const pointCoords = JSON.parse(value) as [number, number]
          osmCoords = pointCoords
          break

        case "lineString":
          const lineCoords = JSON.parse(value) as [number, number][]
          osmCoords = midPoint(lineCoords) as [number, number]
          break

        case "multiLineString":
          const multiLineCoords = JSON.parse(value) as [number, number][][]
          // Use the first line for simplicity
          if (multiLineCoords.length > 0 && multiLineCoords[0]) {
            osmCoords = midPoint(multiLineCoords[0]) as [number, number]
          }
          break

        case "polygon":
          const polygonCoords = JSON.parse(value) as [number, number][]
          const polygonFeature = polygon([polygonCoords])
          const center = centroid(polygonFeature)
          osmCoords = center.geometry.coordinates as [number, number]
          break

        case "unknown":
          break
      }

      if (osmCoords) {
        return `https://www.openstreetmap.org/?mlat=${osmCoords[1]}&mlon=${osmCoords[0]}&zoom=16`
      }
    }

    // Handle location fields
    if (fieldName === "location") {
      const locationData =
        typeof value === "string"
          ? (JSON.parse(value) as { lat: number; lng: number })
          : (value as unknown as { lat: number; lng: number })
      if (locationData.lat && locationData.lng) {
        return `https://www.openstreetmap.org/?mlat=${locationData.lat}&mlon=${locationData.lng}&zoom=16`
      }
    }

    // Return original value if no OSM link generation applies
    return value
  } catch (error) {
    // If parsing fails, return original value
    console.warn(`Failed to process ${fieldName} for OSM link: ${error}`)
    return value
  }
}

type Props = {
  userEmail: string
  subject: string
  markdown: string
  fieldValues: Record<string, string>
}

export async function surveyEntryCreatedNotificationToUser({
  markdown,
  fieldValues,
  subject,
  userEmail,
}: Props) {
  let emailMarkdown = markdown

  // Replace {{fieldName}} placeholders with actual values
  Object.entries(fieldValues).forEach(([fieldName, value]) => {
    const placeholder = `{{${fieldName}}}`

    // Generate OSM link if applicable, otherwise use original value
    const processedValue =
      (fieldName === "geometryCategory" || fieldName === "location") && value
        ? generateOsmLink(fieldName, value)
        : value

    // default case for other fields
    emailMarkdown = emailMarkdown.replace(
      new RegExp(placeholder, "g"),
      processedValue || "keine Angabe",
    )
  })

  // emailMarkdown += `\n\nEingangsdatum: ${new Date().toLocaleDateString("de-DE")}\n`
  emailMarkdown += `\nHinweis: Dies ist eine automatisiert versandte E-Mail, auf die Sie nicht antworten können.`

  const message: Mail = {
    From: addressNoreply,
    To: [{ Email: userEmail }],
    Subject: subject,
    introMarkdown: emailMarkdown,
  }

  return {
    async send() {
      await sendMail(message)
    },
  }
}
