import React from "react"
import { SuperAdminBox } from "./SuperAdminBox"
import { pinkButtonStyles } from "../links"
import clsx from "clsx"

type Props = { data: any }

export const SuperAdminLogData: React.FC<Props> = ({ data }) => {
  return (
    <SuperAdminBox>
      <button
        className={clsx("inline-flex items-center gap-2", pinkButtonStyles)}
        onClick={() => console.log(data)}
      >
        <code className="pb-0.5 text-xs">console.log</code> Data
      </button>
    </SuperAdminBox>
  )
}
