import Welcome from '../Welcome.vue';

export default {
  title: 'Welcome',
  component: Welcome,
};

export const WelcomeStory = () => {
  return {
    render: (h) => h(Welcome, { listeners: { buttonRequested: () => {} } }),
  };
};
WelcomeStory.storyName = 'Welcome';
