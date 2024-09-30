import { isDev } from "@/src/core/utils"
import { useState } from "react"
import { useMap } from "react-map-gl/maplibre"

export const DebugMapTileBoundaries = () => {
  const { mainMap } = useMap()
  const [show, setShow] = useState(false)
  if (!isDev) return null

  return (
    <button
      onClick={(event) => {
        if (mainMap === undefined) {
          console.log("ERROR DebugMapTileBoundaries: mainMap is undefined")
          return
        }

        setShow(!show)
        mainMap.getMap().showTileBoundaries = !show

        event.preventDefault()
      }}
      className="absolute bottom-1 left-1 rounded bg-pink-300/50 px-0.5"
    >
      Show tile boundaries: {show ? "ON" : "OFF"}
    </button>
  )
}
