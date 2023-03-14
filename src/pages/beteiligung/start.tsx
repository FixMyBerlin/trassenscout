import { BlitzPage, Routes } from "@blitzjs/next"
import router from "next/router"
import { Form } from "src/core/components/forms"
import { pinkButtonStyles } from "src/core/components/links"
import { MetaTags } from "src/core/layouts"
import { LayoutParticipation } from "src/core/layouts/LayoutParticipation"
import {
  FORM_ERROR,
  PartcipationScreenUse,
} from "src/participation/components/ParticipationScreenUse"

const ParticipationMainPage: BlitzPage = () => {
  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await console.log(values)
      await router.push(Routes.ParticipationHomePage())
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <LayoutParticipation>
      <MetaTags noindex title="Beteiligung RS8" />
      <Form submitClassName={pinkButtonStyles} submitText="Weiter" onSubmit={handleSubmit}>
        <PartcipationScreenUse />
      </Form>
    </LayoutParticipation>
  )
}

export default ParticipationMainPage
