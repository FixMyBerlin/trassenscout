import { BlitzPage, Routes } from "@blitzjs/next"
import router from "next/router"
import { useState } from "react"
import { Form, LabeledTextareaField } from "src/core/components/forms"
import { pinkButtonStyles, whiteButtonStyles } from "src/core/components/links"
import { H2 } from "src/core/components/text/Headings"
import { MetaTags } from "src/core/layouts"
import { LayoutParticipation } from "src/core/layouts/LayoutParticipation"
import { ParticipationLabeledCheckboxGroup } from "src/participation/components/form/ParticipationLabeledCheckboxGroup"
import { PartcipationScreenEquipment } from "src/participation/components/screens/ParticipationScreenEquipment"
import {
  FORM_ERROR,
  PartcipationScreenUse,
} from "src/participation/components/screens/ParticipationScreenUse"

const ParticipationMainPage: BlitzPage = () => {
  const screens = [1, 2] // TODO
  const [screenState, setScreenState] = useState(0)

  const handleNextScreen = () => {
    const newScreenState = screenState < screens.length - 1 ? screenState + 1 : screenState
    setScreenState(newScreenState)
    window && window.scrollTo(0, 0)
    console.log(newScreenState)
  }
  const handleBackScreen = () => {
    const newScreenState = screenState > 0 ? screenState - 1 : screenState
    setScreenState(newScreenState)
    window && window.scrollTo(0, 0)
    console.log(newScreenState)
  }

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
        {screenState === 0 && <PartcipationScreenUse />}
        {screenState === 1 && <PartcipationScreenEquipment />}

        {/* <H2>Test Checkboxes</H2>
        <ParticipationLabeledCheckboxGroup
          key={2}
          items={["Ja", "Nein"].map((item) => ({
            name: item,
            label: item,
          }))}
        />
        <H2>Test Textarea</H2>
        <LabeledTextareaField name={"textareatest"} label={"textarea test"} /> */}

        <div>
          <div className="mt-4">
            <button type="button" className={pinkButtonStyles} onClick={handleNextScreen}>
              Weiter (Screen Change)
            </button>
          </div>
          <div className="mt-4">
            <button type="button" className={whiteButtonStyles} onClick={handleBackScreen}>
              Zurück (Screen Change)
            </button>
          </div>
        </div>
      </Form>
    </LayoutParticipation>
  )
}

export default ParticipationMainPage
