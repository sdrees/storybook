import Welcome from '../Welcome';

export default {
  title: 'Welcome',
  parameters: {
    component: Welcome,
  },
};

export const ToStorybook = () => <Welcome showApp={() => {}} />;

ToStorybook.storyName = 'to Storybook';
