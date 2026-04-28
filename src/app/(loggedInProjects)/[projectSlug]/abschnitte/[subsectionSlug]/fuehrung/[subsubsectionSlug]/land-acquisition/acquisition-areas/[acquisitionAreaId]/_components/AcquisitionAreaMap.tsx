"use client"

import {
  ACQUISITION_POTENTIAL_AREAS_SOURCE_ID,
  AcquisitionAlkisParcelsLayers,
  AcquisitionAreaOverlaysLayers,
  getAcquisitionClickTargetLayerIds,
} from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/fuehrung/[subsubsectionSlug]/land-acquisition/acquisition-areas/[acquisitionAreaId]/_components/AcquisitionAreaLayers"
import {
  polygonFeatureToFeatureCollection,
  potentialAcquisitionAreasToFeatureCollection,
} from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/fuehrung/[subsubsectionSlug]/land-acquisition/acquisition-areas/[acquisitionAreaId]/_components/potentialAcquisitionAreaGeoJson"
import { PotentialAcquisitionArea } from "@/src/app/(loggedInProjects)/[projectSlug]/abschnitte/[subsectionSlug]/fuehrung/[subsubsectionSlug]/land-acquisition/acquisition-areas/[acquisitionAreaId]/_components/potentialAcquisitionAreaTypes"
import { BackgroundGeometryLayers } from "@/src/core/components/Map/BackgroundGeometryLayers"
import { BaseMap } from "@/src/core/components/Map/BaseMap"
import { geometryBbox } from "@/src/core/components/Map/utils/bboxHelpers"
import { ModalCloseButton } from "@/src/core/components/Modal"
import { Spinner } from "@/src/core/components/Spinner"
import { HeadingWithAction } from "@/src/core/components/text/HeadingWithAction"
import type { AlkisWfsParcelFeatureCollection } from "@/src/server/alkis/alkisWfsParcelGeoJsonTypes"
import { SubsubsectionWithPosition } from "@/src/server/subsubsections/queries/getSubsubsection"
import type { Feature, MultiPolygon, Polygon } from "geojson"
import { useCallback, useEffect, useMemo, useState } from "react"
import { MapLayerMouseEvent, Popup, useMap } from "react-map-gl/maplibre"
import { formatPropertyValue, sortedPropertyEntries } from "./parcelFeatureProperties"

type Props = {
  subsubsection: SubsubsectionWithPosition
  bufferPolygonFeature: Feature<Polygon | MultiPolygon> | null
  parcels: AlkisWfsParcelFeatureCollection
  isLoading: boolean
  errorMessage: string | null
  potentialAcquisitionAreas: PotentialAcquisitionArea[]
  setPotentialAcquisitionAreas: (areas: PotentialAcquisitionArea[]) => void
  classHeight?: string
}

function PotentialAcquisitionAreasFeatureState({
  potentialAcquisitionAreas,
}: {
  potentialAcquisitionAreas: PotentialAcquisitionArea[]
}) {
  const { mainMap } = useMap()

  useEffect(
    function syncPotentialAreaFeatureState() {
      if (!mainMap) return
      const map = mainMap.getMap()
      if (!map.getSource(ACQUISITION_POTENTIAL_AREAS_SOURCE_ID)) return

      for (const area of potentialAcquisitionAreas) {
        map.setFeatureState(
          { source: ACQUISITION_POTENTIAL_AREAS_SOURCE_ID, id: area.id },
          { selected: area.selected },
        )
      }
    },
    [mainMap, potentialAcquisitionAreas],
  )

  return null
}

export function AcquisitionAreaMap({
  subsubsection,
  bufferPolygonFeature,
  parcels,
  isLoading,
  errorMessage,
  potentialAcquisitionAreas,
  setPotentialAcquisitionAreas,
  classHeight = "h-96 sm:h-[500px]",
}: Props) {
  const [contextParcel, setContextParcel] = useState<{
    longitude: number
    latitude: number
    properties: Record<string, unknown>
  } | null>(null)

  const bufferOutlineData = useMemo(
    () => polygonFeatureToFeatureCollection(bufferPolygonFeature),
    [bufferPolygonFeature],
  )
  const acquisitionAreasFc = potentialAcquisitionAreasToFeatureCollection(potentialAcquisitionAreas)

  const handleParcelClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0]
      if (!feature?.properties) return

      const { alkisParcelId } = feature.properties
      if (alkisParcelId == null) return

      setPotentialAcquisitionAreas(
        potentialAcquisitionAreas.map((a) =>
          a.alkisParcelId === alkisParcelId ? { ...a, selected: !a.selected } : a,
        ),
      )
    },
    [potentialAcquisitionAreas, setPotentialAcquisitionAreas],
  )

  const handleContextMenu = useCallback((event: MapLayerMouseEvent) => {
    event.preventDefault()
    const feature = event.features?.[0]
    if (!feature?.properties) {
      setContextParcel(null)
      return
    }
    setContextParcel({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
      properties: feature.properties,
    })
  }, [])

  return (
    <div className="relative w-full">
      <BaseMap
        id="mainMap"
        initialViewState={{
          bounds: geometryBbox(bufferPolygonFeature?.geometry ?? subsubsection.geometry),
          fitBoundsOptions: { padding: 40 },
        }}
        interactiveLayerIds={getAcquisitionClickTargetLayerIds()}
        onClick={handleParcelClick}
        onContextMenu={handleContextMenu}
        scrollZoom
        classHeight={classHeight}
        colorSchema="subsubsection"
      >
        <BackgroundGeometryLayers subsubsections={[subsubsection]} colorSchema="subsubsection" />
        <AcquisitionAlkisParcelsLayers parcels={parcels} />

        <AcquisitionAreaOverlaysLayers
          bufferOutlineData={bufferOutlineData}
          acquisitionAreasFc={acquisitionAreasFc}
        />

        <PotentialAcquisitionAreasFeatureState
          potentialAcquisitionAreas={potentialAcquisitionAreas}
        />

        {contextParcel && (
          <Popup
            longitude={contextParcel.longitude}
            latitude={contextParcel.latitude}
            closeButton={false}
            closeOnClick
            maxWidth="400px"
            className="z-50 [&_.maplibregl-popup-content]:bg-transparent! [&_.maplibregl-popup-content]:p-0!"
            onClose={() => setContextParcel(null)}
          >
            <div className="w-full overflow-hidden bg-white text-left shadow-xl">
              <div className="p-3">
                <HeadingWithAction className="mb-4">
                  <p className="text-base font-bold">Flurstück Details</p>
                  <ModalCloseButton onClose={() => setContextParcel(null)} />
                </HeadingWithAction>
                <div className="max-h-64 overflow-y-auto text-sm text-gray-700">
                  <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-x-3 gap-y-1.5">
                    {sortedPropertyEntries(contextParcel.properties).map(([key, value]) => (
                      <div key={key} className="contents">
                        <dt className="text-sm wrap-break-word text-gray-500">{key}</dt>
                        <dd className="text-sm font-medium wrap-break-word text-gray-900">
                          {formatPropertyValue(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {sortedPropertyEntries(contextParcel.properties).length === 0 && (
                    <p className="text-sm text-gray-500">Keine Attribute in diesem Feature.</p>
                  )}
                </div>
              </div>
            </div>
          </Popup>
        )}
      </BaseMap>

      <div className="pointer-events-none absolute inset-x-0 bottom-10 mx-12 flex justify-center">
        <div className="max-w-full rounded bg-white/80 p-4 px-8 text-center text-base text-gray-800">
          {isLoading && (
            <div className="flex items-center justify-center">
              <Spinner size="5" />
            </div>
          )}
          {errorMessage && <span className="text-rose-700">{errorMessage}</span>}
          {!isLoading && errorMessage == null && (
            <>
              <span>{parcels.features.length} Flurstücke aus ALKIS geladen.</span>
              <br />
            </>
          )}
          Klick = auswählen/abwählen
          <br />
          Rechtsklick = Details
        </div>
      </div>
    </div>
  )
}
