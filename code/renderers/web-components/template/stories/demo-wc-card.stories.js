import { html } from 'lit';
import './demo-wc-card';

export default {
  component: 'demo-wc-card',
};

const Template = ({ backSide, header, rows }) =>
  html`
    <demo-wc-card .backSide="${backSide}" .header="${header}" .rows="${rows}"
      >A simple card</demo-wc-card
    >
  `;

export const Front = Template.bind({});
Front.args = { backSide: false, header: undefined, rows: [] };
