import { ComponentStory, ComponentMeta } from "@storybook/react"
import { Link } from "./Link"
import { Routes } from "@blitzjs/next"

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "links/Link",
  component: Link,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: "color" },
  },
} as ComponentMeta<typeof Link>

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Link> = (args) => <Link {...args} />

export const Internal = Template.bind({})
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Internal.args = {
  href: Routes.Home(),
  children: "Link Internal",
}

export const External = Template.bind({})
External.args = {
  href: "https://www.fixmycity.de",
  children: "Link External",
}

export const Unstyled = Template.bind({})
Unstyled.args = {
  href: Routes.Home(),
  classNameOverwrites: "",
  children: "Link Unstyled",
}

export const Blank = Template.bind({})
Blank.args = {
  href: Routes.Home(),
  blank: true,
  children: "Link New Window",
}

export const Button = Template.bind({})
Blank.args = {
  href: Routes.Home(),
  button: true,
  children: "Link New Window",
}
