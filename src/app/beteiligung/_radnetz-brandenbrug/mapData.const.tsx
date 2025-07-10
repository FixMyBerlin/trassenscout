import { MapData } from "@/src/app/beteiligung/_shared/types"

export const mapData: MapData = {
  sources: {
    netzentwurf: {
      pmTilesUrl: "https://tilda-geo.de/api/uploads/bb-ramboll-netzentwurf-2-beteiligung",
      layers: [
        {
          id: "Netzentwurf-highlighted",
          type: "line",
          minzoom: 6,
          maxzoom: 22,
          layout: {
            visibility: "visible",
          },
          paint: {
            "line-color": "#F5814D",
            "line-width": ["interpolate", ["linear"], ["zoom"], 0, 4, 8, 8, 13.8, 12],
            "line-opacity": ["case", ["boolean", ["feature-state", "selected"], false], 1, 0],
          },
        },
        {
          id: "Netzentwurf",
          type: "line",
          minzoom: 6,
          maxzoom: 22,
          layout: {
            visibility: "visible",
          },
          paint: {
            "line-color": "hsl(30, 100%, 50%)",
            "line-width": ["interpolate", ["linear"], ["zoom"], 0, 1, 8, 1.5, 13.8, 5],
            "line-dasharray": [3, 2],
          },
          beforeId: "netzentwurf-Netzentwurf-highlighted",
        },
      ],
      interactiveLayerIds: ["Netzentwurf", "Netzentwurf-highlighted"],
    },
  },
  colorClass: "border-l-[#F5E4B7]",
}
