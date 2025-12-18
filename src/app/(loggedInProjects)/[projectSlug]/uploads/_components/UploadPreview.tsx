"use client"

import { UploadIcon } from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadIcon"
import {
  UPLOAD_SIZES,
  UploadSize,
} from "@/src/app/(loggedInProjects)/[projectSlug]/uploads/_components/utils/uploadSizes"
import getUploadWithRelations from "@/src/server/uploads/queries/getUploadWithRelations"
import { useQuery } from "@blitzjs/rpc"
import { UserGroupIcon } from "@heroicons/react/24/outline"
import { twJoin } from "tailwind-merge"

type Props = {
  uploadId: number
  projectSlug: string
  size: UploadSize
  showTitle: boolean
  onClick?: () => void
}

export const UploadPreview = ({ uploadId, projectSlug, size, showTitle, onClick }: Props) => {
  const [upload] = useQuery(
    getUploadWithRelations,
    { projectSlug, id: uploadId },
    {
      // Prevent refetching to avoid NotFoundError when upload is deleted
      retry: false,
      retryOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // Keep stale data to prevent refetch when upload is deleted
      staleTime: Infinity,
    },
  )

  // Check if upload was marked as deleted or is null
  if (!upload || (upload as any).__deleted) return null

  const sizeConfig = UPLOAD_SIZES[size]

  const iconContainer = (
    <span className={twJoin(sizeConfig.containerHeight, "w-full overflow-hidden rounded-md")}>
      <UploadIcon upload={upload} projectSlug={projectSlug} size={size} />
    </span>
  )

  const descriptionText = showTitle ? (
    <p className="mt-1 w-full flex-none truncate text-left">{upload.title || "-"}</p>
  ) : null

  const collaborationIcon =
    upload.collaborationUrl && size !== "table" ? (
      <div className="absolute -top-1 -right-1 z-10 rounded-full bg-yellow-500 p-1.5">
        <UserGroupIcon className="size-4 text-white" />
      </div>
    ) : null

  const containerClassName = size === "grid" ? "max-w-[112px]" : ""

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={twJoin(
          "relative flex cursor-pointer flex-col items-start justify-center rounded-md bg-white text-xs ring-1 ring-gray-200/30 hover:bg-gray-50 hover:ring-2 hover:ring-gray-300/60 hover:outline-hidden",
          containerClassName,
        )}
        title={upload.title}
      >
        {collaborationIcon}
        {iconContainer}
        {descriptionText}
      </button>
    )
  }

  return (
    <div className={twJoin("relative", containerClassName)}>
      {collaborationIcon}
      {iconContainer}
      {descriptionText}
    </div>
  )
}
