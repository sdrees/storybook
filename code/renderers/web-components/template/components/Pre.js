/* eslint-disable import/extensions */
import { html } from 'lit-html';
import { styleMap } from 'lit-html/directives/style-map.js';

/**
 * Helper component for rendering text or data
 */
export const Pre = ({ style, object, text }) =>
  html`
    <pre data-testid="pre" style=${styleMap({ style })}>
      ${object ? JSON.stringify(object, null, 2) : text}
    </pre
    >
  `;
