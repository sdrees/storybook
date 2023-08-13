import { DocPipe } from './doc-pipe.pipe';

export default {
  component: DocPipe,
};

const modules = {
  declarations: [DocPipe],
};

export const Basic = () => ({
  moduleMetadata: modules,
  template: `<div><h1>{{ 'DocPipe' | docPipe }}</h1></div>`,
});
