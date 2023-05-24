import React from "react"

type Props = {
  icon: any
  title: string | null
  subtitle?: string | null
}

export const TitleLabel: React.FC<Props> = ({ icon, title, subtitle }) => (
  <div className="p-[7px]" title={`${title}\n${subtitle}`}>
    <div className="flex">
      <div className="flex items-center">{icon}</div>
      <div className="ml-[5px] text-[14px] leading-[20px]">
        <div className="max-w-[13rem] truncate">{title}</div>
        {subtitle && <div className="max-w-[13rem] truncate text-gray-500">{subtitle}</div>}
      </div>
    </div>
  </div>
)
