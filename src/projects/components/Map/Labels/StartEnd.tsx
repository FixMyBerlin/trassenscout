import React from "react"

import IconRoute from "../Icons/route"

type Props = {
  icon: any
  start: string
  end: string
}

export const StartEnd: React.FC<Props> = ({ icon, start, end }) => (
  <div className="p-[5px]">
    <div className="flex">
      <div className="flex items-center">{icon}</div>
      <div className="ml-[10px] pt-[7px]">
        <IconRoute />
      </div>
      <div className="ml-[5px] text-[14px] leading-[20px]">
        <div>{start}</div>
        <div>{end}</div>
      </div>
    </div>
  </div>
)
