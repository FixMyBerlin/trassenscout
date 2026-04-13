import { StateKeyEnum } from "@prisma/client"
import type { FeatureCollection, GeoJsonProperties, Geometry } from "geojson"
import { useEffect, useMemo, useRef, useState } from "react"
import { isAlkisWfsAvailableForProject } from "../../../app/api/(auth)/[projectSlug]/alkis-wfs-parcels/_utils/alkisStateConfig"
import {
  type AlkisViewportBbox,
  emptyAlkisFeatureCollection,
  fetchAlkisParcels,
} from "./utils/fetchAlkisParcels"

type UseAlkisParcelsArgs = {
  alkisStateKey?: StateKeyEnum | null
  bbox?: AlkisViewportBbox | null
  enabled: boolean
}

type UseAlkisParcelsResult = {
  isAvailable: boolean
  isLoading: boolean
  error: string | null
  data: FeatureCollection<Geometry, GeoJsonProperties>
}

function getBboxCacheKey(alkisStateKey: StateKeyEnum, bbox: AlkisViewportBbox) {
  return `${alkisStateKey}:${bbox.map((value) => value.toFixed(5)).join(",")}`
}

export function useAlkisParcels({ alkisStateKey, bbox, enabled }: UseAlkisParcelsArgs) {
  const cacheRef = useRef(new Map<string, FeatureCollection<Geometry, GeoJsonProperties>>())
  const [data, setData] = useState<FeatureCollection<Geometry, GeoJsonProperties>>(
    emptyAlkisFeatureCollection,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAvailable = isAlkisWfsAvailableForProject(alkisStateKey)

  const bboxCacheKey = useMemo(() => {
    if (!bbox || !alkisStateKey) return null
    return getBboxCacheKey(alkisStateKey, bbox)
  }, [alkisStateKey, bbox])

  useEffect(() => {
    if (!enabled || !isAvailable || !alkisStateKey || !bbox || !bboxCacheKey) {
      setIsLoading(false)
      setError(null)
      setData(emptyAlkisFeatureCollection)
      return
    }

    const cached = cacheRef.current.get(bboxCacheKey)
    if (cached) {
      setData(cached)
      setError(null)
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsLoading(true)
        setError(null)
        const nextData = await fetchAlkisParcels({
          alkisStateKey,
          bbox,
          signal: controller.signal,
        })
        cacheRef.current.set(bboxCacheKey, nextData)
        setData(nextData)
      } catch (nextError) {
        if (controller.signal.aborted) return
        setData(emptyAlkisFeatureCollection)
        setError(
          nextError instanceof Error
            ? nextError.message
            : "ALKIS-Flurstücke konnten nicht geladen werden.",
        )
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }, 300)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [alkisStateKey, bbox, bboxCacheKey, enabled, isAvailable])

  return {
    isAvailable,
    isLoading,
    error,
    data,
  }
}
