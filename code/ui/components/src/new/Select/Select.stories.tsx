import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { Select } from './Select';

const meta: Meta<typeof Select.Root> = {
  title: 'Select',
  component: Select.Root,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof Select.Root>;

export const Base: Story = {
  args: {},
  render: (_, { args }) => (
    <div style={{ width: 400 }}>
      <Select.Root {...args}>
        <Select.Trigger>
          <Select.Value placeholder="Select a fruit…" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="Avocado">Avocado</Select.Item>
          <Select.Item value="Banana">Banana</Select.Item>
          <Select.Item value="Bilberry">Bilberry</Select.Item>
          <Select.Item value="Blackberry">Blackberry</Select.Item>
          <Select.Item value="Blackcurrant">Blackcurrant</Select.Item>
          <Select.Item value="Black sapote">Black sapote</Select.Item>
          <Select.Item value="Blueberry">Blueberry</Select.Item>
          <Select.Item value="Boysenberry">Boysenberry</Select.Item>
          <Select.Item value="Breadfruit">Breadfruit</Select.Item>
          <Select.Item value="Cacao">Cacao</Select.Item>
          <Select.Item value="Cactus pear">Cactus pear</Select.Item>
          <Select.Item value="Canistel">Canistel</Select.Item>
          <Select.Item value="Catmon">Catmon</Select.Item>
          <Select.Item value="Cempedak">Cempedak</Select.Item>
          <Select.Item value="Cherimoya">Cherimoya</Select.Item>
          <Select.Item value="Cherry">Cherry</Select.Item>
          <Select.Item value="Chico fruit">Chico fruit</Select.Item>
          <Select.Item value="Cloudberry">Cloudberry</Select.Item>
          <Select.Item value="Coco de mer">Coco de mer</Select.Item>
          <Select.Item value="Coconut">Coconut</Select.Item>
          <Select.Item value="Crab apple">Crab apple</Select.Item>
          <Select.Item value="Cranberry">Cranberry</Select.Item>
          <Select.Item value="Currant">Currant</Select.Item>
          <Select.Item value="Damson">Damson</Select.Item>
          <Select.Item value="Date">Date</Select.Item>
          <Select.Item value="Dragonfruit">Dragonfruit</Select.Item>
          <Select.Item value="Durian">Durian</Select.Item>
          <Select.Item value="Elderberry">Elderberry</Select.Item>
          <Select.Item value="Feijoa">Feijoa</Select.Item>
          <Select.Item value="Fig">Fig</Select.Item>
          <Select.Item value="Finger Lime">Finger Lime</Select.Item>
          <Select.Item value="Gac Fruit">Gac Fruit</Select.Item>
          <Select.Item value="Goji berry">Goji berry</Select.Item>
          <Select.Item value="Gooseberry">Gooseberry</Select.Item>
          <Select.Item value="Grape">Grape</Select.Item>
          <Select.Item value="Raisin">Raisin</Select.Item>
          <Select.Item value="Grapefruit">Grapefruit</Select.Item>
          <Select.Item value="Grewia asiatica">Grewia asiatica</Select.Item>
          <Select.Item value="Guava">Guava</Select.Item>
          <Select.Item value="Guyabano">Guyabano</Select.Item>
          <Select.Item value="Hala Fruit">Hala Fruit</Select.Item>
          <Select.Item value="Honeyberry">Honeyberry</Select.Item>
          <Select.Item value="Huckleberry">Huckleberry</Select.Item>
          <Select.Item value="Jabuticaba">Jabuticaba</Select.Item>
          <Select.Item value="Jackfruit">Jackfruit</Select.Item>
          <Select.Item value="Jambul">Jambul</Select.Item>
          <Select.Item value="Japanese plum">Japanese plum</Select.Item>
          <Select.Item value="Jostaberry">Jostaberry</Select.Item>
          <Select.Item value="Jujube">Jujube</Select.Item>
          <Select.Item value="Juniper berry">Juniper berry</Select.Item>
          <Select.Item value="Kaffir Lime">Kaffir Lime</Select.Item>
          <Select.Item value="Kiwano">Kiwano</Select.Item>
          <Select.Item value="Kiwifruit">Kiwifruit</Select.Item>
          <Select.Item value="Kumquat">Kumquat</Select.Item>
          <Select.Item value="Lanzones">Lanzones</Select.Item>
          <Select.Item value="Lemon">Lemon</Select.Item>
          <Select.Item value="Lime">Lime</Select.Item>
          <Select.Item value="Loganberry">Loganberry</Select.Item>
          <Select.Item value="Longan">Longan</Select.Item>
          <Select.Item value="Loquat">Loquat</Select.Item>
        </Select.Content>
      </Select.Root>
    </div>
  ),
};
