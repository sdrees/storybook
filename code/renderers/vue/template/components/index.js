import globalThis from 'global';
import Vue from 'vue';

import Button from './Button.vue';
import Pre from './Pre.vue';
import Form from './Form.vue';
import Html from './Html.vue';

globalThis.Components = { Button, Pre, Form, Html };
globalThis.storybookRenderer = 'vue';

// test globally-registered components
Vue.component('global-button', Button);
