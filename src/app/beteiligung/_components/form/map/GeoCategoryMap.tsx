import {
  LayerType,
  SurveyBackgroundSwitcher,
} from "@/src/app/beteiligung/_components/form/map/BackgroundSwitcher"
import { installMapGrabIfTest } from "@/src/app/beteiligung/_components/form/map/installMapGrab"
import { useFieldContext } from "@/src/app/beteiligung/_shared/hooks/form-context"
import { playwrightSendMapLoadedEvent } from "@/tests/_utils/customMapLoadedEvent"
import "maplibre-gl/dist/maplibre-gl.css"
import { useState } from "react"
import Map, {
  Layer,
  MapGeoJSONFeature,
  MapLayerMouseEvent,
  NavigationControl,
  Source,
  useMap,
} from "react-map-gl/maplibre"

type Props = {
  maptilerUrl: string
  // defines the additional data that we want to read from the geometries
  // datakey: the key for our survey response data object
  // propertyName: the name of the property in the geojson that we want to read
  additionalData: { dataKey: string; propertyName: string; label: string }[]
  geoCategoryIdPropertyName: string
  config: {
    bounds: [number, number, number, number]
  }
}

// todo
// allow polygon and point selection
// source layers and styles dynamic
// tbd: initial bbox depends on other field value

export const SurveyGeoCategoryMap = ({
  maptilerUrl,
  config,
  additionalData,
  geoCategoryIdPropertyName,
}: Props) => {
  const { mainMap } = useMap()
  const field = useFieldContext<object>()

  const [selectedLayer, setSelectedLayer] = useState<LayerType>("vector")

  if (mainMap) installMapGrabIfTest(mainMap.getMap(), "mainMap")

  const selectedGeometry = field.form.getFieldValue("geometryCategoryId") || null

  const maptilerApiKey = "ECOoUBmpqklzSCASXxcu"
  const vectorStyle = `${maptilerUrl}?key=${maptilerApiKey}`
  const satelliteStyle = `${"https://api.maptiler.com/maps/hybrid/style.json"}?key=${maptilerApiKey}`

  const handleLayerSwitch = (layer: LayerType) => {
    setSelectedLayer(layer)
  }

  const handleMapClick = (event: MapLayerMouseEvent) => {
    const feature = event.features?.[0]
    if (!feature) return

    const geoCategoryId = feature.properties[geoCategoryIdPropertyName]
    const geometry = feature.geometry

    // geometry and id are always set here
    field.form.setFieldValue("geometryCategoryId", geoCategoryId)
    // @ts-expect-error
    field.handleChange(JSON.stringify(geometry.coordinates))

    // read additional properties and set values in from context
    {
      additionalData.map((data) => {
        const { dataKey, propertyName } = data
        field.form.setFieldValue(dataKey, feature.properties[propertyName])
      })
    }
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
    <div className="relative mt-4 h-[500px]" aria-describedby={field.name + " Hint"}>
      <Map
        id="mainMap"
        scrollZoom={false}
        initialViewState={{
          bounds: config.bounds,
        }}
        mapStyle={selectedLayer === "vector" ? vectorStyle : satelliteStyle}
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
        <NavigationControl showCompass={false} />
        <Source
          key="SourceNetzentwurf"
          type="vector"
          minzoom={6}
          maxzoom={10}
          // todo dynamic source
          tiles={[
            "https://api.maptiler.com/tiles/650084a4-a206-4873-8873-e3a43171b6ea/{z}/{x}/{y}.pbf?key=ECOoUBmpqklzSCASXxcu",
          ]}
        >
          {/* todo dynamic layers and styles */}
          <Layer
            id="LayerNetzentwurf"
            type="line"
            source-layer="default"
            // beforeId="Fühung unklar"
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
            // beforeId="Fühung unklar"
            paint={{
              "line-color": "transparent",
              "line-width": ["interpolate", ["linear"], ["zoom"], 0, 6, 8, 12, 13.8, 10],
            }}
          />
          {/* todo point / polygon */}
          {/* todo styles dynamic */}
          <Layer
            id="LayerSelectedGeoCategory"
            type="line"
            source-layer="default"
            // todo
            layout={{ visibility: selectedGeometry ? "visible" : "none" }}
            filter={["==", geoCategoryIdPropertyName, selectedGeometry || ""]}
            paint={{
              "line-width": 5,
              "line-color": ["case", ["has", "color"], ["get", "color"], "#994F0B"],
              "line-opacity": ["case", ["has", "opacity"], ["get", "opacity"], 1],
            }}
          />
        </Source>
        <div className="absolute bottom-2 left-2 rounded-md border border-gray-400 bg-white/80 p-2 text-base">
          <ul>
            <li>
              <strong>ID:</strong> {selectedGeometry || "Keine Auswahl"} (
              {geoCategoryIdPropertyName})
            </li>
            {additionalData.map((data) => {
              const { label, dataKey, propertyName } = data
              const value = field.form.getFieldValue(dataKey)
              return (
                <li key={dataKey} className="text-black">
                  <strong>{label}: </strong>
                  {value || "Keine Auswahl"} ({propertyName})
                </li>
              )
            })}
          </ul>
        </div>
        <SurveyBackgroundSwitcher
          className="absolute left-4 top-4"
          value={selectedLayer}
          onChange={handleLayerSwitch}
        />
      </Map>
    </div>
  )
}
