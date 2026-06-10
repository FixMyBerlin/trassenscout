import type { StaticOverlayConfig } from "./staticOverlay.types"

/**
 * Display-only OHV haltestellenfoerderung overlay config.
 * Reshaped from mapData.const.tsx - all sources/layers included,
 * but haltestellen layers use static paint (no feature-state hover/selected).
 * Overlay layer IDs are never added to interactiveLayerIds.
 */
export const ohvStaticOverlayConfig: StaticOverlayConfig = {
  sources: {
    // TODO comment in when geometries are simplified in tilda
    // grenzenLandkreis: {
    //   tildaUrl: "https://tilda-geo.de/api/uploads/ohv-grenzen-landkreis",
    //   type: "pmtiles",
    //   layers: [
    //     {
    //       id: "ohv-grenzen-landkreis--line",
    //       type: "line",
    //       filter: ["all"],
    //       layout: { "line-round-limit": 100 },
    //       paint: {
    //         "line-color": "hsla(0, 0%, 20%, 0.56)",
    //         "line-width": ["interpolate", ["linear"], ["zoom"], 5, 1, 8, 2, 12, 3, 16, 6],
    //       },
    //     },
    //     {
    //       id: "ohv-grenzen-landkreis--symbol",
    //       type: "symbol",
    //       filter: ["all"],
    //       layout: {
    //         "text-field": "Grenze Landkreis Oberhavel",
    //         "symbol-placement": "line",
    //         "text-offset": [0, 0],
    //         "text-anchor": "top",
    //         "text-font": ["Roboto Regular", "Arial Unicode MS Regular"],
    //         "text-padding": 4,
    //         "text-size": 12,
    //       },
    //       paint: { "text-color": "hsla(0, 0%, 0%, 0.38)" },
    //     },
    //   ],
    // },
    haltestellen: {
      tildaUrl: "https://tilda-geo.de/api/uploads/ohv-haltestellen",
      type: "geojson",
      layers: [
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
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              6,
              1.5,
              8,
              2,
              10,
              3,
              12,
              5,
              14,
              9,
              16,
              7,
              18,
              6,
            ],
            "circle-opacity": 0.7,
          },
        },
      ],
    },
    buslinien: {
      tildaUrl: "https://tilda-geo.de/api/uploads/ohv-busverbindungen",
      type: "pmtiles",
      layers: [
        {
          id: "ohv-busverbindungen--line",
          type: "line" as const,
          filter: ["all"],
          layout: { visibility: "visible" },
          paint: {
            "line-color": "rgba(233, 202, 48, 0.6)",
            "line-width": ["interpolate", ["linear"], ["zoom"], 9, 1, 12, 2, 14, 4],
          },
          beforeId: "haltestellen-ohv-haltestellen--circle",
        },
        {
          id: "ohv-busverbindungen--symbol",
          type: "symbol" as const,
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
      tildaUrl: "https://tilda-geo.de/api/uploads/ohv-grenzen-gemeinden",
      type: "pmtiles",
      layers: [
        {
          id: "ohv-grenzen-gemeinden--line",
          type: "line" as const,
          filter: ["all"],
          layout: { "line-round-limit": 100 },
          paint: {
            "line-color": "rgba(51, 51, 51, 0.3)",
            "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.5, 12, 2, 16, 4],
          },
        },
        {
          id: "ohv-grenzen-gemeinden--symbol",
          type: "symbol" as const,
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
        },
      ],
    },
  },
}
