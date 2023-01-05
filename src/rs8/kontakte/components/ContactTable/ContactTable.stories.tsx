import React from 'react';
import {
  ComponentStory,
  ComponentMeta,
  ComponentStoryObj,
} from '@storybook/react';
import { ContactTable } from './ContactTable';
import { contacts } from '../../fakeServer/rs8/contacts.const';

export default {
  title: 'PageContact/PageContactContactTable',
  component: ContactTable,
} as ComponentMeta<typeof ContactTable>;

const Template: ComponentStory<typeof ContactTable> = (args) => (
  <ContactTable {...args} />
);

export const Default: ComponentStoryObj<typeof ContactTable> = Template.bind(
  {}
);

Default.args = {
  contacts,
};
