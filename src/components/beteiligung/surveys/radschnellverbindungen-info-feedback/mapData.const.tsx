import { MapData } from "@/src/components/beteiligung/shared/types"

/** Colors aligned with radschnellverbindungen.info / rsv-info `mapColors`. */
const rsvMapColors = {
  /** Vorzugstrasse */
  main: "#34D399",
  /** Selected highlight (darker emerald for clear contrast) */
  selected: "#047857",
} as const

/**
 * Live Planungsabschnitt geometries from project `rsv-d`.
 * Requires `Project.exportEnabled` for that project.
 */
export const mapData: MapData = {
  sources: {
    planungsabschnitte: {
      externalUrl: "/api/projects/rsv-d.json",
      type: "geojson",
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
            "line-color": rsvMapColors.selected,
            "line-width": ["interpolate", ["linear"], ["zoom"], 0, 4, 8, 8, 13.8, 12],
            "line-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 1, 0],
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
            "line-color": rsvMapColors.main,
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
            "fill-color": rsvMapColors.selected,
            "fill-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 0.45, 0],
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
            "fill-color": rsvMapColors.main,
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
            "line-color": rsvMapColors.main,
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
  colorClass: "border-l-[#34D399]",
}
