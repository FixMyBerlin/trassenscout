import { PhotoIcon } from "@heroicons/react/20/solid"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Marker } from "react-map-gl/maplibre"
import { twMerge } from "tailwind-merge"
import { UploadDetailModal } from "@/src/components/uploads/UploadDetailModal"
import { geolocatedUploadsQueryOptions } from "@/src/server/uploads/geolocatedUploadsQueryOptions"
import { UploadMarkerIcon } from "../UploadMarkerIcon"

type Props = {
  projectSlug: string
  interactive: boolean
  excludeUploadId?: number
}

export const UploadMarkers = ({ projectSlug, interactive, excludeUploadId }: Props) => {
  const [isVisible, setIsVisible] = useState(false)
  const [selectedUploadId, setSelectedUploadId] = useState<number | null>(null)

  const { data: uploads = [] } = useQuery(geolocatedUploadsQueryOptions({ projectSlug }))

  const handleMarkerClick = (uploadId: number) => {
    setSelectedUploadId(uploadId)
  }

  const filteredUploads = excludeUploadId
    ? uploads.filter((upload) => upload.id !== excludeUploadId)
    : uploads

  return (
    <>
      {isVisible &&
        filteredUploads.map((upload) => (
          <Marker
            key={upload.id}
            longitude={upload.longitude}
            latitude={upload.latitude}
            anchor="bottom"
            onClick={() => handleMarkerClick(upload.id)}
            style={{ cursor: interactive ? "pointer" : "default", zIndex: 1 }}
          >
            <UploadMarkerIcon upload={upload} />
          </Marker>
        ))}
      {filteredUploads.length > 0 && (
        <div className="absolute top-20 right-2 z-[5]">
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className={twMerge(
              "relative rounded-md border border-gray-300 p-1.5 shadow-xs",
              "focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-hidden",
              "hover:bg-gray-50",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white",
              isVisible ? "bg-blue-50" : "bg-white",
            )}
            title={isVisible ? "verortete Dokumente ausblenden" : "verortete Dokumente anzeigen"}
          >
            <PhotoIcon className="size-5 text-gray-700" />
            <span
              className={
                isVisible
                  ? "absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-blue-600 bg-blue-600 px-1 text-xs font-medium text-white"
                  : "absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-blue-600 bg-white px-1 text-xs font-medium text-blue-600"
              }
            >
              {filteredUploads.length}
            </span>
          </button>
        </div>
      )}
      {interactive && (
        <UploadDetailModal
          uploadId={selectedUploadId}
          projectSlug={projectSlug}
          open={selectedUploadId !== null}
          onClose={() => setSelectedUploadId(null)}
        />
      )}
    </>
  )
}
