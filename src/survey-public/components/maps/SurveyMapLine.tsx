import { LayerType } from "@/src/core/components/Map/BackgroundSwitcher"
import { SurveyBackgroundSwitcher } from "@/src/survey-public/components/maps/SurveyBackgroundSwitcher"
import {
  getFeedbackDefinitionBySurveySlug,
  getResponseConfigBySurveySlug,
} from "@/src/survey-public/utils/getConfigBySurveySlug"
import { playwrightSendMapLoadedEvent } from "@/tests/_utils/customMapLoadedEvent"
import { clsx } from "clsx"
import maplibregl, { MapGeoJSONFeature } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import Map, {
  Layer,
  MapLayerMouseEvent,
  NavigationControl,
  Source,
  useMap,
} from "react-map-gl/maplibre"
import { DebugMapTileBoundaries } from "./DebugMapTileBoundaries"
import { SurveyMapLineBanner } from "./SurveyMapLineBanner"

export type SurveyMapProps = {
  className?: string
  children?: React.ReactNode
  projectMap: {
    maptilerUrl: string
    config: {
      bounds: [number, number, number, number]
    }
  }
}

export const SurveyMapLine: React.FC<SurveyMapProps> = ({ projectMap, className }) => {
  const { mainMap } = useMap()
  const [isMediumScreen, setIsMediumScreen] = useState(false)
  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")

  const { setValue, getValues, watch } = useFormContext()

  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }
  // "radnetz-brandenburg" is hard coded as this component will be deleted anyway
  const { evaluationRefs } = getResponseConfigBySurveySlug("radnetz-brandenburg")
  const feedbackDefinition = getFeedbackDefinitionBySurveySlug("radnetz-brandenburg")

  const lineQuestionId = evaluationRefs["line-id"]
  const geometryQuestionId = evaluationRefs["line-geometry"]
  const lineFromToNameQuestionId = evaluationRefs["line-from-to-name"]

  // take line geometry from form context - if it is not defined use initialMarker fallback from feedback.ts configuration
  const selectedLine = getValues()[`custom-${geometryQuestionId}`] || null

  //  update the map when we have a new value for the line
  const watchLine = watch(`custom-${geometryQuestionId}`)

  const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"

  const vectorStyle = `${projectMap.maptilerUrl}?key=${maptilerApiKey}`
  const satelliteStyle = `${"https://api.maptiler.com/maps/hybrid/style.json"}?key=${maptilerApiKey}`

  useEffect(() => {
    const lgMediaQuery = window.matchMedia("(min-width: 768px)")
    // @ts-ignore
    function onMediaQueryChange({ matches }) {
      setIsMediumScreen(matches)
    }
    onMediaQueryChange(lgMediaQuery)
    lgMediaQuery.addEventListener("change", onMediaQueryChange)
    return () => {
      lgMediaQuery.removeEventListener("change", onMediaQueryChange)
    }
  }, [])

  const firstPageQuestionIds = feedbackDefinition.pages[0]?.questions.map((q) => q.id)

  const { config } = projectMap

  const handleMapClick = (event: MapLayerMouseEvent) => {
    const line = event.features?.[0]

    if (!line) return

    // get data that we need from line
    const lineId = line.properties["Verbindung"]
    const lineFrom = line.properties["from_name"]
    const lineTo = line.properties["to_name"]
    const lineGeometry = line.geometry

    // set values for line id, geometry and from-to-name in form context
    setValue(
      `custom-${lineFromToNameQuestionId}`,
      `${lineFrom || "unbekannt"} - ${lineTo || "unbekannt"}`,
    )
    setValue(`custom-${lineQuestionId}`, lineId || "unbekannt")
    // @ts-expect-error we know that the geometry is a line string
    setValue(`custom-${geometryQuestionId}`, JSON.stringify(lineGeometry.coordinates), {
      shouldValidate: true,
      shouldDirty: true,
    })
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

  const handleLoad = () => {
    playwrightSendMapLoadedEvent()
  }

  const [cursorStyle, setCursorStyle] = useState("grab")

  return (
    <div className={clsx("h-[500px]", className)}>
      <Map
        id="mainMap"
        scrollZoom={false}
        initialViewState={{
          bounds: config.bounds,
        }}
        mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
        mapLib={maplibregl}
        RTLTextPlugin={false}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        maxZoom={13}
        minZoom={7}
        // hash={true}
        cursor={cursorStyle}
        // todo survey update layer name
        interactiveLayerIds={["LayerNetzentwurfClicktarget"]}
        onLoad={handleLoad}
      >
        {isMediumScreen && <NavigationControl showCompass={false} />}
        <DebugMapTileBoundaries />
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
          <Layer
            id="LayerNetzentwurfClicktarget"
            type="line"
            source-layer="default"
            beforeId="Fühung unklar"
            paint={{
              "line-color": "transparent",
              "line-width": ["interpolate", ["linear"], ["zoom"], 0, 6, 8, 12, 13.8, 10],
            }}
          />
          <Layer
            id="LayerSelectedLine"
            type="line"
            source-layer="default"
            layout={{ visibility: selectedLine ? "visible" : "none" }}
            filter={["==", "Verbindung", getValues()[`custom-${lineQuestionId}`] || ""]}
            paint={{
              "line-width": 5,
              "line-color": ["case", ["has", "color"], ["get", "color"], "#994F0B"],
              "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 1],
            }}
          />
        </Source>

        <SurveyMapLineBanner
          className="absolute bottom-12"
          lineFromToName={getValues()[`custom-${lineFromToNameQuestionId}`] || null}
        />

        <SurveyBackgroundSwitcher
          className="absolute left-4 top-4"
          value={selectedLayer}
          onChange={handleLayerSwitch}
        />
      </Map>
    </div>
  )
}
