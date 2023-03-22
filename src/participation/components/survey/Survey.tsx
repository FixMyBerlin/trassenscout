import { Routes } from "@blitzjs/next"
import router from "next/router"
import { useState } from "react"
import { LngLatBoundsLike, ViewState } from "react-map-gl"
import { Form, FORM_ERROR } from "src/core/components/forms"
import { pinkButtonStyles } from "src/core/components/links"
import { MetaTags } from "src/core/layouts"
import { LayoutParticipation } from "../core/LayoutParticipation"
import { NavigationParticipation } from "../core/NavigationParticipation"

export { FORM_ERROR } from "src/core/components/forms"

import { Page, TSurvey } from "./Page"

type Props = { survey: TSurvey; onSubmit: ([]) => void }
export type TConfig = Partial<Pick<ViewState, "longitude" | "latitude" | "zoom">> & {
  bounds?: LngLatBoundsLike
  zoomDiff?: number
}
const map = {
  initialMarker: {
    lat: 52.505743315292676,
    lng: 13.439531515319231,
  },
  projectGeometry: {
    type: "MultiLineString",
    coordinates: [
      [
        [13.467931, 52.504393],
        [13.467309, 52.504917],
        [13.466715, 52.505385],
        [13.466632, 52.50544],
        [13.466545, 52.505499],
        [13.465651, 52.506256],
        [13.465277, 52.50656],
        [13.465014, 52.506773],
        [13.464841, 52.506901],
        [13.464793, 52.506936],
        [13.464716, 52.507013],
        [13.46479, 52.507086],
        [13.464836, 52.507133],
        [13.465274, 52.507573],
      ],
      [
        [13.465274, 52.507573],
        [13.465279, 52.507578],
      ],
    ],
  },
  config: {
    bounds: [13.368215305236783, 52.482770463629336, 13.491453514701735, 52.53102559302558],
    maxZoom: 14,
    minZoom: 6,
  },
}

const staticMap = {
  projectGeometry: {
    type: "MultiLineString",
    coordinates: [
      [
        [13.467931, 52.504393],
        [13.467309, 52.504917],
        [13.466715, 52.505385],
        [13.466632, 52.50544],
        [13.466545, 52.505499],
        [13.465651, 52.506256],
        [13.465277, 52.50656],
        [13.465014, 52.506773],
        [13.464841, 52.506901],
        [13.464793, 52.506936],
        [13.464716, 52.507013],
        [13.46479, 52.507086],
        [13.464836, 52.507133],
        [13.465274, 52.507573],
      ],
      [
        [13.465274, 52.507573],
        [13.465279, 52.507578],
      ],
    ],
  },
  config: {
    zoom: 12,
  },
}

export const Survey: React.FC<Props> = ({ survey, onSubmit }) => {
  const [pageProgress, setPageProgress] = useState(1)

  const handleNextPage = () => {
    const newPageProgress = pageProgress < pages.length ? pageProgress + 1 : pages.length
    setPageProgress(newPageProgress)
    window && window.scrollTo(0, 0)
    console.log(newPageProgress)
  }
  const handleBackPage = () => {
    const newPageProgress = pageProgress > 1 ? pageProgress - 1 : 1
    setPageProgress(newPageProgress)
    window && window.scrollTo(0, 0)
    console.log(newPageProgress)
  }

  const handleReset = () => {
    setPageProgress(1)
    console.log("reset")
    // TODO reset object data
  }

  const buttonActions = {
    next: handleNextPage,
    back: handleBackPage,
    reset: handleReset,
  }

  const { pages } = survey

  const handleSubmit = (values: Record<string, null | string | boolean>) => {
    const responses: Record<string, null | string | number | number[]> = {}
    Object.entries(values).forEach(([k, v]) => {
      const [questionType, questionId, responseId] = k.split("-")
      switch (questionType) {
        case "single":
          responses[questionId!] = v === null ? null : Number(v)
          break
        case "multi":
          if (!(questionId! in responses)) responses[questionId!] = []
          // @ts-ignore
          if (v) responses[questionId!].push(Number(responseId))
          break
        case "text":
          responses[questionId!] = v === "" ? null : String(v)
          break
      }
    })
    onSubmit(Object.entries(responses).map(([k, v]) => [Number(k), v]))
  }

  return (
    <LayoutParticipation
      navigation={
        <NavigationParticipation progress={{ current: pageProgress, total: pages.length }} />
      }
    >
      <MetaTags noindex title="Beteiligung RS8" />
      <Form submitClassName={pinkButtonStyles} onSubmit={handleSubmit}>
        {pages.map((page) => {
          if (pageProgress === page.id)
            return <Page key={page.id} page={page} buttonActions={buttonActions} />
        })}
      </Form>
    </LayoutParticipation>
  )
}
