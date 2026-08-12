import { MapData } from "@/src/components/beteiligung/shared/types"

/**
 * Live Planungsabschnitt geometries from the Trassenscout public project export.
 * Requires `Project.exportEnabled` for project `rs23` (seed sets this for local/demo use).
 */
export const mapData: MapData = {
  sources: {
    planungsabschnitte: {
      externalUrl: "/api/projects/rs23.json",
      type: "geojson",
      promoteId: "subsectionSlug",
      layers: [
        {
          id: "pa-line-highlighted",
          type: "line",
          filter: ["==", ["geometry-type"], "LineString"],
          layout: {
            visibility: "visible",
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "#F5814D",
              "#111827",
            ],
            "line-width": ["interpolate", ["linear"], ["zoom"], 0, 4, 8, 8, 13.8, 12],
            "line-opacity": [
              "case",
              [
                "any",
                ["boolean", ["feature-state", "selected"], false],
                ["boolean", ["feature-state", "hover"], false],
              ],
              1,
              0,
            ],
          },
        },
        {
          id: "pa-line",
          type: "line",
          filter: ["==", ["geometry-type"], "LineString"],
          layout: {
            visibility: "visible",
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#2563eb",
            "line-width": ["interpolate", ["linear"], ["zoom"], 0, 2, 8, 3, 13.8, 6],
          },
          beforeId: "planungsabschnitte-pa-line-highlighted",
        },
        {
          id: "pa-polygon-highlighted",
          type: "fill",
          filter: ["==", ["geometry-type"], "Polygon"],
          layout: {
            visibility: "visible",
          },
          paint: {
            "fill-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "#F5814D",
              "#4B5563",
            ],
            "fill-opacity": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              0.45,
              ["boolean", ["feature-state", "hover"], false],
              0.35,
              0,
            ],
          },
        },
        {
          id: "pa-polygon",
          type: "fill",
          filter: ["==", ["geometry-type"], "Polygon"],
          layout: {
            visibility: "visible",
          },
          paint: {
            "fill-color": "#2563eb",
            "fill-opacity": 0.25,
          },
          beforeId: "planungsabschnitte-pa-polygon-highlighted",
        },
        {
          id: "pa-polygon-outline",
          type: "line",
          filter: ["==", ["geometry-type"], "Polygon"],
          layout: {
            visibility: "visible",
          },
          paint: {
            "line-color": [
              "case",
              ["boolean", ["feature-state", "selected"], false],
              "#F5814D",
              ["boolean", ["feature-state", "hover"], false],
              "#111827",
              "#2563eb",
            ],
            "line-width": 2,
          },
          beforeId: "planungsabschnitte-pa-polygon",
        },
      ],
      interactiveLayerIds: [
        "pa-line",
        "pa-line-highlighted",
        "pa-polygon",
        "pa-polygon-highlighted",
      ],
    },
  },
  colorClass: "border-l-[#2563eb]",
}
