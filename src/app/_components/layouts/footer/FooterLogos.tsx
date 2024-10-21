"use client"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { getProxyImageSrc } from "@/src/core/utils/getProxyImageSrc"
import getProject from "@/src/server/projects/queries/getProject"
import { useQuery } from "@blitzjs/rpc"
import { clsx } from "clsx"
import Image from "next/image"

type Props = { className?: string }

export const FooterLogos = ({ className }: Props) => {
  const projectSlug = useProjectSlug()
  const [project] = useQuery(getProject, { projectSlug })

  const logos = project.partnerLogoSrcs?.filter(Boolean)
  if (!logos.length) return null

  return (
    <div className="flex">
      <ul
        className={clsx(
          "mx-auto grid w-full grid-flow-row grid-cols-3 items-center justify-evenly gap-8 pb-4 sm:grid-cols-4 md:grid-cols-5",
          className,
        )}
      >
        {logos.map((partnerLogo) => (
          <li className="relative mx-auto h-16 w-20" key={partnerLogo}>
            <Image
              className="mx-auto object-contain"
              fill
              src={getProxyImageSrc(partnerLogo)}
              alt=""
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
