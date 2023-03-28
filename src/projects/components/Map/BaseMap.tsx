import clsx from "clsx"
import "maplibre-gl/dist/maplibre-gl.css"
import React from "react"
import { MapProvider } from "react-map-gl"
import { BaseMapView, BaseMapViewProps } from "./BaseMapView"

export const BaseMap: React.FC<BaseMapViewProps> = ({
  sections,
  isInteractive,
  selectedSection,
  className,
  children,
}) => {
  return (
    <div className={clsx(className, "relative h-full w-full")}>
      <MapProvider>
        <BaseMapView
          sections={sections}
          isInteractive={isInteractive}
          selectedSection={selectedSection}
          className={className}
        >
          {children}
        </BaseMapView>
      </MapProvider>
    </div>
  )
}
