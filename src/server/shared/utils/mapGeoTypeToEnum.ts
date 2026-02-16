import { GeometryTypeEnum } from "@prisma/client"

export const mapGeoTypeToEnum = (geometryType: string) => {
  if (geometryType === "Point" || geometryType === "MultiPoint") return "POINT"
  if (geometryType === "LineString" || geometryType === "MultiLineString") return "LINE"
  if (geometryType === "Polygon" || geometryType === "MultiPolygon") return "POLYGON"
  return "LINE" // fallback
}

export const GEOMETRY_TYPE_HELP_TEXT = {
  LINE: "Zeichnen Sie eine Linie auf der Karte. Mit 'Snappen' können Sie die Linie am Planungsabschnitt ausrichten.",
  POINT:
    "Setzen Sie einen Punkt auf der Karte. Mit 'Snappen' wird der Punkt am nächsten Punkt des Planungsabschnitts platziert.",
  POLYGON:
    "Zeichnen Sie eine Fläche auf der Karte. Mit 'Snappen' werden die Eckpunkte am Planungsabschnitt ausgerichtet.",
} as const satisfies Record<GeometryTypeEnum, string>
