import React from "react"

type Props = {
  icon: any
  title: string | null
}

export const TitleLabel: React.FC<Props> = ({ icon, title }) => (
  <div className="p-[7px]">
    <div className="flex">
      <div className="flex items-center">{icon}</div>
      <div className="ml-[5px] text-[14px] leading-[20px]">
        <div>{title}</div>
      </div>
    </div>
  </div>
)
