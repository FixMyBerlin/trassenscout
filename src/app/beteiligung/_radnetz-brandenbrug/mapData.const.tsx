import { MapData } from "@/src/app/beteiligung/_shared/types"

export const mapData: MapData = {
  sources: {
    netzentwurf: {
      // dies ist nicht der Netzentwurf der realen Beteiligung, sondern ein Dummy-Netzentwurf
      pmTilesUrl: "https://tilda-geo.de/api/uploads/bb-tmb-routen",
      layers: [
        {
          id: "bb-netzentwurf--highlight",
          type: "line",
          filter: ["all"],
          layout: {
            visibility: "visible",
          },
          paint: {
            "line-color": "#ff0000",
            "line-width": ["interpolate", ["linear"], ["zoom"], 0, 4, 8, 8, 13.8, 12],
            "line-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 1, 0],
          },
        },
        {
          id: "bb-netzentwurf",
          type: "line",
          filter: ["all"],
          layout: {
            visibility: "visible",
          },
          paint: {
            "line-color": "hsl(30, 100%, 50%)",
            "line-width": ["interpolate", ["linear"], ["zoom"], 0, 1, 8, 1.5, 13.8, 5],
            "line-dasharray": [3, 2],
          },
          beforeId: "netzentwurf-bb-netzentwurf--highlight",
        },
      ],
      interactiveLayerIds: ["bb-netzentwurf", "bb-netzentwurf--highlight"],
    },
  },
  colorClass: "border-l-[#F5E4B7]",
}
