import { MapData } from "@/src/components/beteiligung/shared/types"

/** Colors aligned with the ohv-radverkehr survey (primary color). */
const ohvMapColors = {
  /** Planungsabschnitt */
  main: "#02558e",
  /** Selected highlight (orange for clear contrast) */
  selected: "#f5824d",
  /** Hover: near-black line / gray fill */
  hoverLine: "#111827",
  hoverFill: "#4B5563",
} as const

/**
 * Live Planungsabschnitt geometries from the project `ohv-radverkehr` (`exportEnabled: true`).
 */
export const mapData: MapData = {
  sources: {
    planungsabschnitte: {
      externalUrl: "/api/projects/ohv-radverkehr.json",
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
              ohvMapColors.selected,
              ohvMapColors.hoverLine,
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
            "line-color": ohvMapColors.main,
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
              ohvMapColors.selected,
              ohvMapColors.hoverFill,
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
            "fill-color": ohvMapColors.main,
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
              ohvMapColors.selected,
              ["boolean", ["feature-state", "hover"], false],
              ohvMapColors.hoverLine,
              ohvMapColors.main,
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
  colorClass: "border-l-[#02558e]",
}
