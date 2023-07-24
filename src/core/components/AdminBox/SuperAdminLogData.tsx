import React from "react"
import clsx from "clsx"
import { pinkButtonStyles } from "../links"
import { SuperAdminBox } from "./SuperAdminBox"

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
