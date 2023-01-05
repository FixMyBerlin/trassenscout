import React from "react"
import { PageHeader } from "src/core/components/PageHeader"
import { dates } from "src/fakeServer/rs8/dates.const"
import { Calender } from "../Calender"

export const PageCalender: React.FC = () => {
  return (
    <>
      <PageHeader
        title="Termine"
        description="Dieser Bereich hilft Ihnen dabei Termine zu finden."
      />
      <Calender dates={dates} />
    </>
  )
}
