import { MapData } from "@/src/app/beteiligung/_shared/types"

export const mapData: MapData = {
  sources: {
    haltestellen: {
      pmTilesUrl: "https://tilda-geo.de/api/uploads/ohv-haltestellen",
      layers: [
        {
          id: "ohv-haltestellen--circle--highlight",
          type: "circle",
          filter: ["all"],
          layout: {
            visibility: "visible",
          },
          paint: {
            "circle-color": [
              "case",
              [
                "all",
                ["boolean", ["feature-state", "hover"], false],
                ["boolean", ["feature-state", "selected"], false],
              ],
              "#ff6600",
              ["boolean", ["feature-state", "hover"], false],
              "#ff9933",
              ["boolean", ["feature-state", "selected"], false],
              "#A44317",
              "#000000",
            ],
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 8, 5, 12, 7, 16, 9],
            "circle-opacity": [
              "case",
              [
                "all",
                ["boolean", ["feature-state", "hover"], false],
                ["boolean", ["feature-state", "selected"], false],
              ],
              1,
              ["boolean", ["feature-state", "hover"], false],
              0.5,
              ["boolean", ["feature-state", "selected"], false],
              1,
              0,
            ],
            "circle-stroke-opacity": [
              "case",
              [
                "any",
                ["boolean", ["feature-state", "hover"], false],
                ["boolean", ["feature-state", "selected"], false],
              ],
              1,
              0,
            ],
            "circle-stroke-color": "black",
            "circle-stroke-width": 2,
          },
        },
        {
          id: "ohv-haltestellen--circle",
          type: "circle",
          filter: ["all"],
          layout: {
            visibility: "visible",
          },
          paint: {
            "circle-color": "#F5814D",
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 0, 3, 8, 6, 12, 8, 16, 10],
            "circle-opacity": 0.6,
          },
          beforeId: "haltestellen-ohv-haltestellen--circle--highlight",
        },
      ],
      interactiveLayerIds: ["ohv-haltestellen--circle", "ohv-haltestellen--circle--highlight"],
    },
    buslinien: {
      pmTilesUrl: "https://tilda-geo.de/api/uploads/ohv-busverbindungen",
      layers: [
        {
          id: "ohv-busverbindungen--line",
          type: "line",
          filter: ["all"],
          layout: {
            visibility: "visible",
          },
          paint: {
            "line-color": "#E9CA3099",
            "line-width": 4,
            "line-opacity": 0.9,
          },
          beforeId: "haltestellen-ohv-haltestellen--circle",
        },
      ],
    },
    grenzenGemeinde: {
      pmTilesUrl: "https://tilda-geo.de/api/uploads/ohv-grenzen-gemeinden",
      layers: [
        {
          id: "ohv-grenzen-gemeinden--line",
          type: "line",
          filter: ["all"],
          layout: {
            visibility: "visible",
          },
          paint: {
            "line-color": "#FFB6C1",
            "line-width": 2,
            "line-opacity": 0.8,
          },
          beforeId: "buslinien-ohv-busverbindungen--line",
        },
      ],
    },
    grenzenLandkreis: {
      pmTilesUrl: "https://tilda-geo.de/api/uploads/ohv-grenzen-landkreis",
      layers: [
        {
          id: "ohv-grenzen-landkreis--line",
          type: "line",
          filter: ["all"],
          layout: {
            visibility: "visible",
          },
          paint: {
            "line-color": "#4682B4",
            "line-width": 2,
            "line-opacity": 0.8,
          },
          beforeId: "buslinien-ohv-busverbindungen--line",
        },
      ],
    },
  },
  // legends: <LegendBestand />,
  colorClass: "border-l-[#F5E4B7]",
}
