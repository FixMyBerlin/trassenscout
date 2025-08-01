import { AllLayers, generateLayers } from "@/src/app/beteiligung/_components/form/map/AllLayers"
import { AllSources } from "@/src/app/beteiligung/_components/form/map/AllSources"
import { createGeoJSONFromString } from "@/src/app/beteiligung/_components/form/map/utils"
import { AllowedSurveySlugs } from "@/src/app/beteiligung/_shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import { BackgroundSwitcher, LayerType } from "@/src/core/components/Map/BackgroundSwitcher"
import { featureCollection, point } from "@turf/helpers"
import maplibregl, { DataDrivenPropertyValueSpecification } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import * as pmtiles from "pmtiles"
import { useEffect, useState } from "react"
import Map, {
  Layer,
  LayerProps,
  LngLatBoundsLike,
  MapGeoJSONFeature,
  MapLayerMouseEvent,
  NavigationControl,
  Source,
} from "react-map-gl/maplibre"
import { useMapSelection } from "./useMapSelection.nuqs"
import { useResponseDetails } from "./useResponseDetails.nuqs"

type Props = {
  maptilerUrl: string
  defaultViewState?: LngLatBoundsLike
  surveyResponses: any[]
  locationRef: string
  categoryGeometryRef?: string
  //todo survey clean up after survey BB
  surveySlug: AllowedSurveySlugs
  additionalMapData?: any
}

export const SurveyResponseOverviewMap = ({
  maptilerUrl,
  defaultViewState,
  categoryGeometryRef,
  locationRef,
  surveyResponses,
  surveySlug,
  additionalMapData,
}: Props) => {
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const { responseDetails, setResponseDetails } = useResponseDetails()
  const { mapSelection, setMapSelection } = useMapSelection(
    surveyResponses?.length ? [surveyResponses[0]?.id] : [],
  )
  const metaConfig = getConfigBySurveySlug(surveySlug, "meta")
  const [cursorStyle, setCursorStyle] = useState("grab")
  const surveyResponsesWithLocation = surveyResponses.filter((r) => r.data[locationRef])
  // Setup pmtiles
  useEffect(() => {
    const protocol = new pmtiles.Protocol()
    maplibregl.addProtocol("pmtiles", protocol.tile)
    return () => {
      maplibregl.removeProtocol("pmtiles")
    }
  }, [])

  const surveyResponsesGeometryCategoryCoordinates = surveyResponses.map((response) => {
    return {
      geometryCoordinates:
        categoryGeometryRef && response.data[categoryGeometryRef]
          ? response.data[categoryGeometryRef]
          : // we need to provide a fallback geometry for rs8 & frm7 where the geometry category was not introduced yet
            JSON.stringify(metaConfig.geoCategoryFallback),
      responseId: Number(response.id),
      status: response.status,
      hasLocation: Boolean(response.data[locationRef]),
    }
  })

  const surveyResponsesWithoutLocationFeatures = surveyResponsesGeometryCategoryCoordinates
    .filter(({ hasLocation }) => !hasLocation)
    .map(({ geometryCoordinates, responseId, status }) =>
      createGeoJSONFromString(geometryCoordinates, { status, id: responseId }, { id: responseId }),
    )

  const surveyResponsesGeometryCategoryFeatures = surveyResponsesGeometryCategoryCoordinates
    .filter(({ hasLocation }) => hasLocation)
    .map(({ geometryCoordinates, responseId, status }) =>
      createGeoJSONFromString(
        geometryCoordinates,
        { status, geometryCategoryFor: responseId },
        { id: `geometryCategory-${responseId}` },
      ),
    )

  const { status: statusConfig } = getConfigBySurveySlug(surveySlug, "backend")

  const statusColor: any = [
    "match",
    ["get", "status"],
    ...statusConfig.flatMap(({ value, color }) => [value, color]),
    "white",
  ]
  const selectedStrokeWidth: DataDrivenPropertyValueSpecification<number> = [
    "interpolate",
    ["linear"],
    ["zoom"],
    0,
    2,
    8,
    2,
    14,
    6,
  ]
  const lineOffsetLeft: DataDrivenPropertyValueSpecification<number> = [
    "interpolate",
    ["linear"],
    ["zoom"],
    0,
    -2,
    8,
    -4,
    14,
    -8,
  ]
  const lineOffsetRight: DataDrivenPropertyValueSpecification<number> = [
    "interpolate",
    ["linear"],
    ["zoom"],
    0,
    2,
    8,
    4,
    14,
    8,
  ]
  const strokeColor = "#7c3aed"
  const selectedColor = "#43474d"
  const circleRadius: DataDrivenPropertyValueSpecification<number> = [
    "interpolate",
    ["linear"],
    ["zoom"],
    0,
    1,
    8,
    4,
    14,
    12,
  ]

  const layers: LayerProps[] = [
    {
      filter: ["==", ["get", "geometryType"], "point"],
      id: "survey-responses-with-location",
      type: "circle",
      paint: {
        "circle-color": statusColor,
        "circle-radius": circleRadius,
        "circle-opacity": 1,
        "circle-stroke-color": strokeColor,
        "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 0, 1, 8, 2, 14, 6],
      },
    },
    {
      filter: ["==", ["get", "geometryType"], "line"],
      id: "survey-responses-without-location",
      type: "line",
      beforeId: "survey-responses-with-location",
      paint: {
        "line-color": "transparent",
        "line-opacity": 0.8,
        "line-width": ["interpolate", ["linear"], ["zoom"], 0, 1, 8, 1.5, 13.8, 7],
      },
    },
    {
      filter: ["==", ["get", "geometryType"], "line"],
      id: "lines-right",
      beforeId: "survey-responses-with-location",
      type: "line",
      paint: {
        "line-width": 2,
        "line-opacity": 0.6,
        "line-offset": lineOffsetRight,
        "line-color": strokeColor,
      },
    },
    {
      filter: ["==", ["get", "geometryType"], "line"],
      id: "lines-left",
      beforeId: "survey-responses-with-location",
      type: "line",
      paint: {
        "line-color": strokeColor,
        "line-width": 2,
        "line-opacity": 0.6,
        "line-offset": lineOffsetLeft,
      },
    },
    {
      filter: ["==", ["get", "geometryType"], "polygon"],
      id: "survey-responses-without-location-polygon-clicktarget",
      type: "fill",
      beforeId: "survey-responses-with-location",
      paint: {
        "fill-color": "transparent",
        "fill-outline-color": strokeColor,
      },
    },
    {
      filter: ["==", ["get", "geometryType"], "line"],
      id: "survey-responses-without-location-clicktarget",
      type: "line",
      paint: {
        "line-color": selectedColor,
        "line-opacity": 0,
        "line-width": ["interpolate", ["linear"], ["zoom"], 0, 8, 8, 16, 14, 18],
      },
    },
    // selected layer styles
    {
      filter: [
        "all",
        ["==", ["get", "geometryType"], "point"],
        ["match", ["id"], mapSelection, true, false],
      ],
      id: "survey-responses-with-location-selected",
      type: "circle",
      paint: {
        "circle-color": statusColor,
        "circle-radius": circleRadius,
        "circle-opacity": 1,
        "circle-stroke-color": selectedColor,
        "circle-stroke-width": selectedStrokeWidth,
      },
    },
    {
      filter: [
        "all",
        ["==", ["get", "geometryType"], "line"],
        // @ts-expect-error this works todo
        ["match", ["id"], ...mapSelection.flatMap((id) => [id, true]), false],
      ],
      id: "lines-right-selected",
      beforeId: "survey-responses-with-location",
      type: "line",
      paint: {
        "line-width": selectedStrokeWidth,
        "line-opacity": 1,
        "line-offset": lineOffsetRight,
        "line-color": selectedColor,
      },
    },
    {
      filter: [
        "all",
        ["==", ["get", "geometryType"], "line"],
        // @ts-expect-error this works todo
        ["match", ["id"], ...mapSelection.flatMap((id) => [id, true]), false],
      ],
      id: "lines-left-selected",
      beforeId: "survey-responses-with-location",
      type: "line",
      paint: {
        "line-color": selectedColor,
        "line-width": selectedStrokeWidth,
        "line-opacity": 1,
        "line-offset": lineOffsetLeft,
      },
    },
    {
      filter: [
        "all",
        ["==", ["get", "geometryType"], "polygon"],
        // @ts-expect-error this works todo
        ["match", ["id"], ...mapSelection.flatMap((id) => [id, true]), false],
      ],
      id: "survey-responses-without-location-polygon-clicktarget-selected",
      type: "fill",
      beforeId: "survey-responses-with-location",
      paint: {
        "fill-color": "transparent",
        "fill-outline-color": selectedColor,
      },
    },
    // details layers
    {
      filter: [
        "all",
        ["==", ["get", "geometryType"], "point"],
        ["==", ["id"], responseDetails],
        // @ts-expect-error this works todo
        ["match", ["id"], ...mapSelection.flatMap((id) => [id, true]), false],
      ],
      id: "survey-responses-with-location-details",
      type: "circle",
      paint: {
        "circle-color": statusColor,
        "circle-radius": circleRadius,
        "circle-opacity": 1,
        "circle-stroke-color": "black",
        "circle-stroke-width": selectedStrokeWidth,
      },
    },
    {
      filter: [
        "all",
        ["==", ["get", "geometryType"], "line"],
        ["==", ["id"], responseDetails],
        // @ts-expect-error this works todo
        ["match", ["id"], ...mapSelection.flatMap((id) => [id, true]), false],
      ],
      id: "lines-right-details",
      beforeId: "survey-responses-with-location",
      type: "line",
      paint: {
        "line-width": selectedStrokeWidth,
        "line-opacity": 1,
        "line-offset": lineOffsetRight,
        "line-color": "black",
      },
    },
    {
      filter: [
        "all",
        ["==", ["get", "geometryType"], "line"],
        ["==", ["id"], responseDetails],
        // @ts-expect-error this works todo
        ["match", ["id"], ...mapSelection.flatMap((id) => [id, true]), false],
      ],
      id: "lines-left-details",
      beforeId: "survey-responses-with-location",
      type: "line",
      paint: {
        "line-color": "black",
        "line-width": selectedStrokeWidth,
        "line-opacity": 1,
        "line-offset": lineOffsetLeft,
      },
    },
    {
      filter: [
        "all",
        ["==", ["get", "geometryType"], "polygon"],
        ["==", ["id"], responseDetails],
        // @ts-expect-error this works todo
        ["match", ["id"], ...mapSelection.flatMap((id) => [id, true]), false],
      ],
      id: "survey-responses-without-location-polygon-clicktarget-details",
      type: "fill",
      beforeId: "survey-responses-with-location",
      paint: {
        "fill-color": "transparent",
        "fill-outline-color": "black",
      },
    },
  ]

  const geometryCategoryLayers: LayerProps[] = [
    {
      filter: [
        "all",
        ["==", ["get", "geometryType"], "line"],
        ["==", ["get", "geometryCategoryFor"], responseDetails],
        // @ts-expect-error this works todo
        [
          "match",
          ["get", "geometryCategoryFor"],
          ...mapSelection.flatMap((id) => [id, true]),
          false,
        ],
      ],
      id: "selected-response-geometry-category",
      beforeId: "survey-responses-with-location",
      type: "line",
      paint: {
        "line-color": "black",
        "line-opacity": 1,
        "line-width": selectedStrokeWidth,
      },
    },
    {
      filter: [
        "all",
        ["==", ["get", "geometryType"], "polygon"],
        ["==", ["get", "geometryCategoryFor"], responseDetails],
        // @ts-expect-error this works todo
        [
          "match",
          ["get", "geometryCategoryFor"],
          ...mapSelection.flatMap((id) => [id, true]),
          false,
        ],
      ],
      id: "selected-response-geometry-category-polygon",
      beforeId: "survey-responses-with-location",
      type: "fill",
      paint: {
        "fill-color": "black",
        "fill-opacity": 0.2,
        "fill-outline-color": "black",
      },
    },
  ]

  const surveyResponsesSource = (
    <Source
      id="surveyResponses"
      key="surveyResponses"
      type="geojson"
      // todo type
      data={featureCollection([
        ...surveyResponsesWithoutLocationFeatures,
        ...surveyResponsesWithLocation.map((r) =>
          point(
            [r.data[locationRef].lng, r.data[locationRef].lat],
            {
              status: r.status,
              geometryType: "point",
            },
            { id: r.id },
          ),
        ),
      ] as any)}
    >
      {layers.map((layer) => (
        <Layer id={layer.id} key={layer.id} {...layer} />
      ))}
    </Source>
  )

  const geometryCategorySource = (
    <Source
      id="geometryCategory"
      key="geometryCategory"
      type="geojson"
      // todo type
      data={featureCollection(surveyResponsesGeometryCategoryFeatures as any)}
    >
      {geometryCategoryLayers.map((layer) => (
        <Layer id={layer.id} key={layer.id} {...layer} />
      ))}
    </Source>
  )

  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"

  const vectorStyle = `${maptilerUrl}?key=${maptilerApiKey}`
  const satelliteStyle = `https://api.maptiler.com/maps/hybrid/style.json?key=${maptilerApiKey}`

  const handleMapClick = (event: MapLayerMouseEvent) => {
    const selectedResponses = event.features
    //  for some reason the mapSelection had duplicated entries
    if (selectedResponses?.length)
      setMapSelection(Array.from(new Set(selectedResponses.map((r) => Number(r.id)))))
    // show details of the first selected response IF there is only one selected
    if (selectedResponses?.length === 1) setResponseDetails(Number(selectedResponses[0]!.id))
  }

  const handleMouseMove = ({ features }: MapLayerMouseEvent) => {
    updateCursor(features)
  }

  const handleMouseLeave = () => {
    updateCursor([])
  }

  const updateCursor = (features: MapGeoJSONFeature[] | undefined) => {
    setCursorStyle(features?.length ? "pointer" : "grab")
  }

  return (
    <div className="h-full rounded-md drop-shadow-md">
      <Map
        id="mainMap"
        initialViewState={{
          bounds: defaultViewState,
        }}
        mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
        minZoom={6}
        maxZoom={20}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        interactiveLayerIds={[
          "survey-responses-with-location",
          "survey-responses-without-location-clicktarget",
          "survey-responses-without-location-polygon-clicktarget",
        ]}
        cursor={cursorStyle}
      >
        {additionalMapData && (
          <>
            <AllSources mapData={additionalMapData} />
            <AllLayers layers={[...generateLayers(additionalMapData)]} />
          </>
        )}
        {surveyResponsesSource}
        {geometryCategorySource}
        <BackgroundSwitcher
          className="absolute left-4 top-4"
          value={selectedLayer}
          onChange={handleLayerSwitch}
        />
        <NavigationControl showCompass={false} />
      </Map>
    </div>
  )
}
