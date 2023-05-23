import React from "react"

import { RouteIcon } from "../Icons"

type Props = {
  icon: any
  start: string
  end: string
}

export const StartEndLabel: React.FC<Props> = ({ icon, start, end }) => (
  <div className="px-[7px] py-[2px]">
    <div className="flex">
      <div className="flex items-center">{icon}</div>
      <div className="ml-[10px] pt-[7px]">
        <RouteIcon />
      </div>
      <div className="ml-[5px] text-[14px] leading-[20px]">
        <div>{start}</div>
        <div>{end}</div>
      </div>
    </div>
  </div>
)
