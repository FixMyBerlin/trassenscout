import { GlobeAltIcon } from "@heroicons/react/24/outline"
import clsx from "clsx"
import Image from "next/image"
import Link from "next/link"
import { linkStyles } from "src/core/components/links"
import FMCIcon from "../assets/fmc-icon.svg"
import LinkedInIcon from "../assets/linkedin-logo.svg"
import RSVIcon from "../assets/rsv-icon.svg"
import TwitterIcon from "../assets/twitter-icon.svg"

const PageHomePublicOnline = () => {
  let onlineList = [
    {
      title: "RSV.info",
      href: "https://radschnellverbindungen.info ",
      logo: RSVIcon,
    },
    {
      title: "Weitere Angebote",
      href: "https://www.fixmycity.de/",
      logo: FMCIcon,
    },
    {
      title: "Auf Twitter",
      href: "https://twitter.com/FixMyBerlin",
      logo: TwitterIcon,
    },
    {
      title: "Auf LinkedIn",
      href: "https://www.linkedin.com/company/fixmycity/",
      logo: LinkedInIcon,
    },
  ]

  return (
    <div className="rounded-2xl border border-zinc-100 p-6 dark:border-zinc-700/40">
      <h2 className="flex text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        <GlobeAltIcon className="h-7 w-7 flex-none text-gray-400" />
        <span className="my-auto ml-3">Im Netz</span>
      </h2>
      <ol className="mt-6 space-y-4">
        {onlineList.map((item, itemIndex) => (
          <li key={itemIndex} className="flex gap-4">
            <div className="relative mt-1 flex flex-none items-center justify-center ">
              {/* <div className="relative mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0"> */}
              <Image
                src={item.logo}
                className="text-gray-400"
                alt="Trassenscout"
                height={32}
                width={32}
              />
            </div>
            <div className="flex flex-auto flex-wrap gap-x-2">
              <dt className="sr-only">Netz-Links</dt>
              <div className={clsx(linkStyles, "my-auto text-sm")}>
                <a target="_blank" href={item.href} rel="noreferrer">
                  {item.title}
                </a>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default PageHomePublicOnline
