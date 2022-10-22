import path from 'path';
import { mount } from 'enzyme';
import initStoryshots from '../src';

initStoryshots({
  framework: 'react',
  configPath: path.join(__dirname, 'exported_metadata'),
  renderer: mount,
});
