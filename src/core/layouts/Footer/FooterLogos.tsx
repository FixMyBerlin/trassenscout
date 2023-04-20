import { useParam } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import Image from "next/image"
import React, { Suspense } from "react"
import { getImageSrc } from "src/core/utils/getImageSrc"
import getProject from "src/projects/queries/getProject"

type Props = { className?: string }

export const FooterLogosWithQuery: React.FC<Props> = ({ className }) => {
  const projectSlug = useParam("projectSlug", "string")
  const [project] = useQuery(getProject, { slug: projectSlug })

  if (!project.partnerLogoSrcs) return null

  return (
    <div className="flex">
      <ul
        className={clsx(
          "mx-auto grid w-full grid-flow-row grid-cols-3 items-center justify-evenly gap-8 pb-4 sm:grid-cols-4 md:grid-cols-5",
          className
        )}
      >
        {project.partnerLogoSrcs.map((partnerLogo) => (
          <li className="relative mx-auto h-16 w-20" key={partnerLogo}>
            <Image
              className="mx-auto object-contain"
              layout="fill"
              src={getImageSrc(partnerLogo)}
              alt="partnerLogo"
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export const FooterLogos: React.FC<Props> = (props) => {
  return (
    <Suspense>
      <FooterLogosWithQuery {...props} />
    </Suspense>
  )
}
