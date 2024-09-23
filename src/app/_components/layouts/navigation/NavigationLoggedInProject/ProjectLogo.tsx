"use client"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { getProxyImageSrc } from "@/src/core/utils/getProxyImageSrc"
import getProject from "@/src/projects/queries/getProject"
import { useQuery } from "@blitzjs/rpc"
import { clsx } from "clsx"
import Image from "next/image"

type Props = {
  className?: string
  size?: "5" | "12"
}

const sizeClasses = {
  "5": "h-5 aspect-square",
  "12": "h-12 aspect-square",
}

export const ProjectLogo = ({ className, size = "5" }: Props) => {
  const projectSlug = useProjectSlug()
  const [project] = useQuery(getProject, { projectSlug })

  if (!project.logoSrc) return null

  return (
    <div className={clsx(className, "relative flex-none", sizeClasses[size])}>
      <Image
        className="object-contain"
        fill
        src={getProxyImageSrc(project.logoSrc)}
        alt="Projektlogo"
      />
    </div>
  )
}
