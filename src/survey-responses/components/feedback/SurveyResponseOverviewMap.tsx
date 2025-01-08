import { BackgroundSwitcher, LayerType } from "@/src/core/components/Map/BackgroundSwitcher"

import { TSurvey } from "@/src/survey-public/components/types"
import { AllowedSurveySlugs } from "@/src/survey-public/utils/allowedSurveySlugs"
import { getBackendConfigBySurveySlug } from "@/src/survey-public/utils/getConfigBySurveySlug"
import { featureCollection, lineString, multiLineString, point, polygon } from "@turf/helpers"
import { DataDrivenPropertyValueSpecification } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { useState } from "react"
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
  // selectedSurveyResponse: any
  surveyResponses: any[]
  locationRef: number
  categoryGeometryRef: number | undefined
  //todo survey clean up after survey BB
  surveySlug: AllowedSurveySlugs
  surveyDefinition: TSurvey
}

export const SurveyResponseOverviewMap: React.FC<Props> = ({
  maptilerUrl,
  defaultViewState,
  categoryGeometryRef,
  surveyDefinition,
  // selectedSurveyResponse,
  locationRef,
  surveyResponses,
  surveySlug,
}) => {
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")
  const { responseDetails, setResponseDetails } = useResponseDetails()
  const { mapSelection, setMapSelection } = useMapSelection(
    surveyResponses?.length ? [surveyResponses[0]?.id] : [],
  )

  const [cursorStyle, setCursorStyle] = useState("grab")
  const surveyResponsesWithLocation = surveyResponses.filter((r) => r.data[locationRef])

  const surveyResponsesGeometryCategoryCoordinates = surveyResponses.map((response) => {
    return {
      geometryCoordinates: categoryGeometryRef
        ? JSON.parse(response.data[categoryGeometryRef])
        : // we need to provide a fallback geometry for rs8 & frm7 where the geometry category was not introduced yet
          surveyDefinition.geometryFallback,
      responseId: Number(response.id),
      status: response.status,
      hasLocation: Boolean(response.data[locationRef]),
    }
  })

  const surveyResponsesWithoutLocationFeatures = surveyResponsesGeometryCategoryCoordinates
    .filter(({ hasLocation }) => !hasLocation)
    .map(({ geometryCoordinates, responseId, status }) =>
      surveyDefinition.geometryCategoryType === "line"
        ? // @ts-expect-error data is of type unknown
          Array.isArray(geometryCoordinates[0][0])
          ? multiLineString(
              // @ts-expect-error data is of type unknown
              geometryCoordinates,
              { status, geometryType: "line" },
              { id: responseId },
            )
          : // @ts-expect-error data is of type unknown
            lineString(geometryCoordinates, { status, geometryType: "line" }, { id: responseId })
        : // @ts-expect-error data is of type unknown
          polygon(geometryCoordinates, { status, geometryType: "polygon" }, { id: responseId }),
    )

  const surveyResponsesGeometryCategoryFeatures = surveyResponsesGeometryCategoryCoordinates
    .filter(({ hasLocation }) => hasLocation)
    .map(({ geometryCoordinates, responseId, status }) =>
      surveyDefinition.geometryCategoryType === "line"
        ? // @ts-expect-error data is of type unknown
          Array.isArray(geometryCoordinates[0][0])
          ? multiLineString(
              // @ts-expect-error data is of type unknown
              geometryCoordinates,
              { status, geometryType: "line", geometryCategoryFor: responseId },
              { id: `geometryCategory-${responseId}` },
            )
          : lineString(
              // @ts-expect-error data is of type unknown
              geometryCoordinates,
              { status, geometryType: "line", geometryCategoryFor: responseId },
              { id: `geometryCategory-${responseId}` },
            )
        : polygon(
            // @ts-expect-error data is of type unknown
            geometryCoordinates,
            { status, geometryType: "polygon", geometryCategoryFor: responseId },
            { id: `geometryCategory-${responseId}` },
          ),
    )

  const { status: statusConfig } = getBackendConfigBySurveySlug(surveySlug)
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
      id: "surveyResponsesWithLocation",
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
      id: "surveyRespnsesWithoutLocation",
      type: "line",
      beforeId: "surveyResponsesWithLocation",
      paint: {
        "line-color": "transparent",
        "line-opacity": 0.8,
        "line-width": ["interpolate", ["linear"], ["zoom"], 0, 1, 8, 1.5, 13.8, 7],
      },
    },
    {
      filter: ["==", ["get", "geometryType"], "line"],
      id: "lines-right",
      beforeId: "surveyResponsesWithLocation",
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
      beforeId: "surveyResponsesWithLocation",
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
      id: "surveyRespnsesWithoutLocationPolygonClicktarget",
      type: "fill",
      beforeId: "surveyResponsesWithLocation",
      paint: {
        "fill-color": "transparent",
        "fill-outline-color": strokeColor,
      },
    },
    {
      filter: ["==", ["get", "geometryType"], "line"],
      id: "surveyRespnsesWithoutLocationClicktarget",
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
      id: "surveyResponsesWithLocation-selected",
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
      beforeId: "surveyResponsesWithLocation",
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
      beforeId: "surveyResponsesWithLocation",
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
      id: "surveyRespnsesWithoutLocationPolygonClicktarget-selected",
      type: "fill",
      beforeId: "surveyResponsesWithLocation",
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
      id: "surveyResponsesWithLocation-details",
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
      beforeId: "surveyResponsesWithLocation",
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
      beforeId: "surveyResponsesWithLocation",
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
      id: "surveyRespnsesWithoutLocationPolygonClicktarget-details",
      type: "fill",
      beforeId: "surveyResponsesWithLocation",
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
      id: "selectdResponseGeometryCategory",
      beforeId: "surveyResponsesWithLocation",
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
      id: "selectdResponseGeometryCategoryPolygon",
      beforeId: "surveyResponsesWithLocation",
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
        <Layer key={layer.id} {...layer} />
      ))}
    </Source>
  )
  const geometryCategorySource = (
    <Source
      key="geometryCategory"
      type="geojson"
      // todo type
      data={featureCollection(surveyResponsesGeometryCategoryFeatures as any)}
    >
      {geometryCategoryLayers.map((layer) => (
        <Layer key={layer.id} {...layer} />
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
        RTLTextPlugin={false}
        minZoom={6}
        maxZoom={16}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        interactiveLayerIds={[
          "surveyResponsesWithLocation",
          "surveyRespnsesWithoutLocationClicktarget",
          "surveyRespnsesWithoutLocationPolygonClicktarget",
        ]}
        cursor={cursorStyle}
      >
        {/*  todo survey clean up after survey BB */}
        {surveySlug === "radnetz-brandenburg" && (
          <Source
            key="SourceNetzentwurf"
            type="vector"
            minzoom={6}
            maxzoom={10}
            tiles={[
              "https://api.maptiler.com/tiles/650084a4-a206-4873-8873-e3a43171b6ea/{z}/{x}/{y}.pbf?key=ECOoUBmpqklzSCASXxcu",
            ]}
          >
            <Layer
              id="LayerNetzentwurf"
              type="line"
              source-layer="default"
              beforeId="Fühung unklar"
              paint={{
                "line-color": "hsl(30, 100%, 50%)",
                "line-width": ["interpolate", ["linear"], ["zoom"], 0, 1, 8, 1.5, 13.8, 5],
                "line-dasharray": [3, 2],
              }}
            />
          </Source>
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
