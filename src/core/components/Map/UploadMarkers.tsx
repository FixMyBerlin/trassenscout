"use client"

import { UploadDetailModal } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadDetailModal"
import { useTrySlugId } from "@/src/core/routes/useSlug"
import getGeolocatedUploads from "@/src/server/uploads/queries/getGeolocatedUploads"
import { useQuery } from "@blitzjs/rpc"
import { PhotoIcon } from "@heroicons/react/20/solid"
import { useState } from "react"
import { Marker } from "react-map-gl/maplibre"
import { twMerge } from "tailwind-merge"
import { UploadMarkerIcon } from "./UploadMarkerIcon"

type Props = {
  projectSlug: string
  interactive: boolean
}

export const UploadMarkers = ({ projectSlug, interactive }: Props) => {
  const excludeUploadId = useTrySlugId("uploadId")
  const [isVisible, setIsVisible] = useState(true)
  const [selectedUploadId, setSelectedUploadId] = useState<number | null>(null)

  const [uploads] = useQuery(getGeolocatedUploads, { projectSlug })

  const handleMarkerClick = (uploadId: number) => {
    setSelectedUploadId(uploadId)
  }

  const filteredUploads = excludeUploadId
    ? uploads.filter((upload) => upload.id !== excludeUploadId)
    : uploads

  return (
    <>
      {isVisible &&
        filteredUploads.map((upload) => {
          return (
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
          )
        })}
      {filteredUploads.length > 0 && (
        <div className="absolute top-20 right-4 z-[5]">
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
