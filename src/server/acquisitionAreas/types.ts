import type { AcquisitionArea } from "@/src/prisma/generated/client"
import type { GeometryByGeometryType } from "@/src/shared/geometry/geometrySchemas"
import type { getAcquisitionArea, getAcquisitionAreas } from "./acquisitionAreas.server"

export type AcquisitionAreaWithTypedGeometry = Omit<AcquisitionArea, "geometry"> & {
  geometry: GeometryByGeometryType<"POLYGON">
  parcel: {
    id: number
    alkisParcelId: string
    alkisParcelIdSource: string
    geometry: GeometryByGeometryType<"POLYGON">
  }
  acquisitionAreaStatus: {
    id: number
    slug: string
    title: string
    style: number
  } | null
}

export type AcquisitionAreaDetail = Awaited<ReturnType<typeof getAcquisitionArea>>
export type AcquisitionAreasList = Awaited<ReturnType<typeof getAcquisitionAreas>>
