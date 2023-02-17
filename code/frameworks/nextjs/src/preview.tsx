import './config/preview';
import { RouterDecorator } from './routing/decorator';
import { StyledJsxDecorator } from './styledJsx/decorator';
import './images/next-image-stub';
import { HeadManagerDecorator } from './head-manager/decorator';

function addNextHeadCount() {
  const meta = document.createElement('meta');
  meta.name = 'next-head-count';
  meta.content = '0';
  document.head.appendChild(meta);
}

addNextHeadCount();

export const decorators = [StyledJsxDecorator, RouterDecorator, HeadManagerDecorator];

export const parameters = {
  docs: {
    source: {
      excludeDecorators: true,
    },
  },
};
