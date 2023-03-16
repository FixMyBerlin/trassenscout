import { XMarkIcon } from "@heroicons/react/20/solid"
import Image from "next/image"
import Link from "next/link"
import { ProgressBar, TProgress } from "src/participation/components/layout/ProgressBar"
import Logo from "./../assets/rsv8-logo.png"

type Props = TProgress

export const NavigationParticipation: React.FC<Props> = ({ progress }) => {
  return (
    <nav className="z-20 shadow-xl">
      <div className="mx-auto flex items-center justify-between px-2 text-gray-500 sm:px-6 lg:pl-5 lg:pr-2.5">
        <div className="flex h-full items-start justify-start">
          <Image width={50} height={50} src={Logo} alt="RS-Logo" />
          <span className="py-5 pl-4">Beteiligung</span>
        </div>
        <Link href="#">
          <XMarkIcon className="h-7 w-7" />
        </Link>
      </div>
      {progress && <ProgressBar progress={progress} />}
    </nav>
  )
}