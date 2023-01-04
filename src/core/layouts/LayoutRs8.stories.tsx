import { ComponentStory, ComponentMeta } from "@storybook/react"
import { Navigation } from "./Navigation/Navigation"

export default {
  title: "Layout/Navigation",
  component: Navigation,
  argTypes: {},
} as ComponentMeta<typeof Navigation>

const Template: ComponentStory<typeof Navigation> = (args) => <Navigation {...args} />

export const Default = Template.bind({})
Default.args = {
  sections: [
    {
      name: "Teilstrecke 1",
      href: "/ts1",
    },
    {
      name: "Teilstrecke 2",
      href: "/ts2",
    },
    {
      name: "Teilstrecke 3",
      href: "/ts3",
    },
  ],
}
