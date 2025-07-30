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
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 8, 3, 10, 4, 12, 8, 14, 15],
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
            "circle-stroke-color": "hsla(0, 0%, 0%, 0)",
            "circle-color": "hsl(19, 89%, 63%)",
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 8, 3, 10, 4, 12, 8, 14, 15],
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
            "line-color": "rgba(233, 202, 48, 0.6)",
            "line-width": ["interpolate", ["linear"], ["zoom"], 9, 1, 12, 2, 14, 4],
          },
          beforeId: "haltestellen-ohv-haltestellen--circle",
        },
        {
          id: "ohv-busverbindungen--symbol",
          type: "symbol",
          filter: ["all"],
          layout: {
            "text-field": ["to-string", ["get", "route_name"]],
            "text-anchor": "top",
            "symbol-placement": "line",
            "text-size": ["interpolate", ["linear"], ["zoom"], 9, 0, 11, 14, 13, 16],
            "text-font": ["Red Hat Text Regular", "Arial Unicode MS Regular"],
            "text-offset": [0, 0],
          },
          paint: {
            "text-color": "hsla(50, 81%, 55%, 0.6)",
            "text-halo-width": 2,
            "text-halo-color": "#ffffff",
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
          layout: { "line-round-limit": 100 },
          paint: {
            "line-color": "rgba(51, 51, 51, 0.3)",
            "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.5, 12, 2, 16, 4],
          },
          beforeId: "buslinien-ohv-busverbindungen--line",
        },
        {
          id: "ohv-grenzen-gemeinden--symbol",
          type: "symbol",
          filter: ["all"],
          layout: {
            "text-offset": [0, 0],
            "text-anchor": "top",
            "text-font": ["Red Hat Text Regular", "Arial Unicode MS Regular"],
            "text-size": 12,
            "text-field": ["get", "GEM_NAME"],
            "text-padding": 20,
          },
          paint: { "text-color": "hsla(0, 0%, 0%, 0.38)" },
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
          layout: { "line-round-limit": 100 },
          paint: {
            "line-color": "hsla(0, 0%, 20%, 0.56)",
            "line-width": ["interpolate", ["linear"], ["zoom"], 5, 1, 8, 2, 12, 3, 16, 6],
          },
          beforeId: "buslinien-ohv-busverbindungen--line",
        },
        {
          id: "ohv-grenzen-landkreis--symbol",
          type: "symbol",
          filter: ["all"],
          layout: {
            "text-field": "Grenze Landkreis Oberhavel",
            "symbol-placement": "line",
            "text-offset": [0, 0],
            "text-anchor": "top",
            "text-font": ["Roboto Regular", "Arial Unicode MS Regular"],
            "text-padding": 4,
            "text-size": 12,
          },
          paint: { "text-color": "hsla(0, 0%, 0%, 0.38)" },
          beforeId: "buslinien-ohv-busverbindungen--line",
        },
      ],
    },
  },
  // legends: <LegendBestand />,
  colorClass: "border-l-[#F5E4B7]",
}
