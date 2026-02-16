import { MapPinIcon, MinusIcon, Squares2X2Icon } from "@heroicons/react/24/outline"
import { GeometryTypeEnum } from "@prisma/client"

type Props = {
  type: GeometryTypeEnum
  className: string
}

export const GeometryIcon = ({ type, className }: Props) => {
  switch (type) {
    case "POINT":
      return <MapPinIcon className={className} />
    case "LINE":
      return <MinusIcon className={className} />
    case "POLYGON":
      return <Squares2X2Icon className={className} />
  }
}
