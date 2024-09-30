import { Spinner } from "@/src/core/components/Spinner"
import { useProjectSlug } from "@/src/core/hooks"
import { getImageSrc } from "@/src/core/utils/getImageSrc"
import getProject from "@/src/projects/queries/getProject"
import { useQuery } from "@blitzjs/rpc"
import { clsx } from "clsx"
import Image from "next/image"
import { Suspense } from "react"

type Props = {
  className?: string
  size?: "5" | "12"
}

const sizeClasses = {
  "5": "h-5 aspect-square",
  "12": "h-12 aspect-square",
}

export const ProjectLogoWithQuery: React.FC<Props> = ({ className, size = "5" }) => {
  const projectSlug = useProjectSlug()
  const [project] = useQuery(getProject, { projectSlug })

  if (!project.logoSrc) return null

  return (
    <div className={clsx(className, "relative flex-none", sizeClasses[size])}>
      <Image className="object-contain" fill src={getImageSrc(project.logoSrc)} alt="Projektlogo" />
    </div>
  )
}

export const ProjectLogo: React.FC<Props> = (props) => {
  return (
    <Suspense fallback={<Spinner />}>
      <ProjectLogoWithQuery {...props} />
    </Suspense>
  )
}
