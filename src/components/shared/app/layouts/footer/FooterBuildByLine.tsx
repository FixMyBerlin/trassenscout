import { HeartIcon } from "@heroicons/react/20/solid"
import { twMerge } from "tailwind-merge"
import { Link } from "@/src/components/core/components/links/Link"

type Props = {
  className?: string
  classNameOverwrites?: string
}

export const FooterBuildByLine = ({ className, classNameOverwrites }: Props) => {
  return (
    <Link
      classNameOverwrites={
        classNameOverwrites ?? twMerge("text-current no-underline hover:text-blue-500", className)
      }
      href="https://www.fixmycity.de"
      blank
    >
      <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <span>Gebaut mit</span>
        <HeartIcon className="size-5 shrink-0" aria-hidden="true" />
        <span>von</span>
        <span>FixMyCity.de</span>
      </span>
    </Link>
  )
}
