import { ComponentStory, ComponentMeta } from "@storybook/react"
import { NavigationGeneral } from "./NavigationGeneral/NavigationGeneral"

export default {
  title: "Example/Header",
  component: NavigationGeneral,
  parameters: {
    // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
} as ComponentMeta<typeof NavigationGeneral>

const Template: ComponentStory<typeof NavigationGeneral> = (args) => <NavigationGeneral />

export const Navigation = Template.bind({})
Navigation.args = {}
