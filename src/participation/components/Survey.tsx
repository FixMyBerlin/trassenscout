import { Routes } from "@blitzjs/next"
import router from "next/router"
import { useState } from "react"
import { Form, FORM_ERROR } from "src/core/components/forms"
import { pinkButtonStyles } from "src/core/components/links"
import { MetaTags } from "src/core/layouts"
import { LayoutParticipation } from "./core/LayoutParticipation"
import { NavigationParticipation } from "./core/NavigationParticipation"

export { FORM_ERROR } from "src/core/components/forms"

import { Page, TSurvey } from "./pages/Page"

type Props = { survey: TSurvey }

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
      </Form>
    </LayoutParticipation>
  )
}
