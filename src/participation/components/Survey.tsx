import { Routes } from "@blitzjs/next"
import router from "next/router"
import { useState } from "react"
import { LngLatBoundsLike, MapProvider, ViewState } from "react-map-gl"
import { Form, FORM_ERROR } from "src/core/components/forms"
import { pinkButtonStyles } from "src/core/components/links"
import { MetaTags } from "src/core/layouts"
import { LayoutParticipation } from "./core/LayoutParticipation"
import { NavigationParticipation } from "./core/NavigationParticipation"
import { ParticipationMap } from "./maps/ParticipationMap"
import { ParticipationStaticMap } from "./maps/ParticipationStaticMap"
import { LastPage } from "./pages/LastPage"

export { FORM_ERROR } from "src/core/components/forms"

import { Page, TSurvey } from "./pages/Page"

type Props = { survey: TSurvey }
export type TConfig = Partial<Pick<ViewState, "longitude" | "latitude" | "zoom">> & {
  bounds?: LngLatBoundsLike
  zoomDiff?: number
}
const map = {
  marker: {
    lat: 52.51328686398023,
    lng: 13.507912153758042,
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
    zoom: 2,
    bounds: [13.412276463418607, 52.49144130153442, 13.750532816664474, 52.671787],
    longitude: 13.5,
    latitude: 52.5,
    boundsPadding: 20,
  },
}

export const Survey: React.FC<Props> = ({ survey }) => {
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

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await console.log(values)
      await router.push(Routes.ParticipationMainPage())
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
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
        <MapProvider>
          <ParticipationMap projectMap={map} />
        </MapProvider>
        <ParticipationStaticMap projectMap={map} />
        <LastPage />
      </Form>
    </LayoutParticipation>
  )
}
